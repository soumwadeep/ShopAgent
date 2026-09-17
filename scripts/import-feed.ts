import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname } from "node:path";
import { parse } from "csv-parse/sync";
import { readSheet } from "read-excel-file/node";
import { feedStores, type FeedStoreId } from "../lib/feed-stores";
import { getAdminFirestore } from "../lib/firebase-admin";

type Row = Record<string, string>;
type Product = { sku: string; title: string; price: number; productUrl: string; imageUrl: string; gtin: string; availability: string; pincode: string; deliveryMinutes: number | null; deliveryFee: number | null; tokens: string[]; expiresAt: string };
const required = ["sku", "title", "price", "product_url", "availability"];
const tokensFor = (value: string) => [...new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? [])];
const arg = (name: string) => { const index = process.argv.indexOf(`--${name}`); return index >= 0 ? process.argv[index + 1] : undefined; };
const urlFor = (value: string, host?: string) => {
  if (!value) return "";
  const url = new URL(value);
  if (url.protocol !== "https:" || (host && url.hostname !== host && !url.hostname.endsWith(`.${host}`))) throw new Error(`Invalid HTTPS URL: ${value}`);
  return url.toString();
};

async function readRows(path: string): Promise<Row[]> {
  if (extname(path).toLowerCase() === ".csv") return parse(await readFile(path), { columns: header => header.map((value: string) => value.trim().toLowerCase()), bom: true, skip_empty_lines: true, trim: true });
  if (extname(path).toLowerCase() !== ".xlsx") throw new Error("Feed must be .csv or .xlsx");
  const sheet = await readSheet(path);
  const [header, ...rows] = sheet;
  if (!header) return [];
  const names = header.map(cell => String(cell ?? "").trim().toLowerCase());
  return rows.filter(row => row.some(cell => cell != null && cell !== "")).map(row => Object.fromEntries(names.map((name, index) => [name, String(row[index] ?? "").trim()])));
}

async function main() {
  const source = arg("source") as FeedStoreId;
  const file = arg("file");
  if (!Object.hasOwn(feedStores, source) || !file) throw new Error("Usage: npm run feed:import -- --source croma --file path.csv [--ttl-hours 24] [--observed-at ISO] [--dry-run]");
  const store = feedStores[source];
  const ttlHours = Number(arg("ttl-hours") ?? "24");
  if (!Number.isInteger(ttlHours) || ttlHours < 1 || ttlHours > 168) throw new Error("TTL must be 1-168 whole hours");
  const observedAt = arg("observed-at") ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(observedAt)) || Date.parse(observedAt) > Date.now() + 60000) throw new Error("Invalid or future observed-at date");
  const expiresAt = new Date(Date.parse(observedAt) + ttlHours * 3600000).toISOString();
  if (Date.parse(expiresAt) <= Date.now()) throw new Error("Feed is already expired");
  const rows = await readRows(file);
  if (!rows.length) throw new Error("Feed has no products");
  for (const key of required) if (!Object.hasOwn(rows[0], key)) throw new Error(`Missing required column: ${key}`);
  if (store.pinRequired && !Object.hasOwn(rows[0], "pincode")) throw new Error("This store needs a pincode column");
  const products = new Map<string, Product>();
  rows.forEach((row, index) => {
    const line = index + 2;
    try {
      const sku = row.sku?.trim();
      const title = row.title?.trim();
      const price = Number(row.price);
      const availability = row.availability?.trim().toLowerCase();
      const pincode = row.pincode?.trim() ?? "";
      const gtin = row.gtin?.trim() ?? "";
      const deliveryMinutes = row.delivery_minutes ? Number(row.delivery_minutes) : null;
      const deliveryFee = row.delivery_fee ? Number(row.delivery_fee) : null;
      if (!sku || !title || title.length < 3 || !Number.isFinite(price) || price < 0 || !["in_stock", "out_of_stock", "unknown"].includes(availability)) throw new Error("Invalid SKU, title, price, or availability");
      if (!row.product_url) throw new Error("Product URL is required");
      if (pincode && !/^\d{6}$/.test(pincode) || store.pinRequired && !pincode) throw new Error("A six-digit pincode is required");
      if (gtin && !/^(\d{8}|\d{12,14})$/.test(gtin)) throw new Error("GTIN must be 8 or 12-14 digits");
      if (deliveryMinutes !== null && (!Number.isInteger(deliveryMinutes) || deliveryMinutes < 1) || deliveryFee !== null && (!Number.isFinite(deliveryFee) || deliveryFee < 0)) throw new Error("Invalid delivery estimate or fee");
      if (deliveryMinutes !== null && !pincode) throw new Error("Delivery estimate needs a matching pincode");
      const product: Product = { sku, title, price, productUrl: urlFor(row.product_url, store.host), imageUrl: urlFor(row.image_url ?? ""), gtin, availability, pincode, deliveryMinutes, deliveryFee, tokens: tokensFor(title), expiresAt };
      const key = `${sku}\0${pincode}`;
      if (products.has(key)) throw new Error("Duplicate SKU and pincode");
      products.set(key, product);
    } catch (error) { throw new Error(`Row ${line}: ${error instanceof Error ? error.message : String(error)}`); }
  });
  console.log(`Validated ${products.size} ${store.name} products, observed ${observedAt}, expires ${expiresAt}.`);
  if (process.argv.includes("--dry-run")) return;
  const db = getAdminFirestore();
  const feedRef = db.collection("retailerFeeds").doc(source);
  await feedRef.set({ state: "updating", observedAt, expiresAt, count: products.size });
  const items = feedRef.collection("items");
  while (true) {
    const old = await items.limit(400).get();
    if (old.empty) break;
    const batch = db.batch();
    old.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  let batch = db.batch();
  let size = 0;
  for (const [key, product] of products) {
    batch.set(items.doc(createHash("sha256").update(key).digest("hex")), product);
    if (++size === 400) { await batch.commit(); batch = db.batch(); size = 0; }
  }
  if (size) await batch.commit();
  await feedRef.set({ state: "ready", observedAt, expiresAt, count: products.size });
  console.log(`Published ${products.size} ${store.name} products.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
