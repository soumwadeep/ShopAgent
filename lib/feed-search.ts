import "server-only";
import { feedStoreIds, feedStores, type FeedStoreId } from "@/lib/feed-stores";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Offer, SourceStatus } from "@/lib/retailers";

type Result = { offers: Offer[]; status: SourceStatus };
const tokensFor = (value: string) => [...new Set(value.toLowerCase().match(/[a-z0-9]+/g) ?? [])].slice(0, 10);

async function searchStore(id: FeedStoreId, query: string, pin: string): Promise<Result> {
  const store = feedStores[id];
  const status = (state: SourceStatus["status"], detail: string): Result => ({ offers: [], status: { source: store.name, status: state, detail } });
  if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON && !process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT) return status("not_connected", "Partner feed not connected");
  try {
    const db = getAdminFirestore();
    const feed = await db.collection("retailerFeeds").doc(id).get();
    const data = feed.data();
    if (!data || data.state !== "ready") return status("not_connected", "Partner feed not connected");
    if (Date.parse(data.expiresAt) <= Date.now()) return status("unavailable", "Partner feed expired");
    if (store.pinRequired && !pin) return status("unavailable", "Set delivery PIN to compare");
    const numericBarcode = /^\d{8}$|^\d{12,14}$/.test(query);
    const terms = tokensFor(query);
    if (!terms.length) return status("unavailable", "No searchable terms");
    const ref = db.collection("retailerFeeds").doc(id).collection("items");
    const snapshot = numericBarcode
      ? await ref.where("gtin", "==", query).limit(30).get()
      : await ref.where("tokens", "array-contains-any", terms).limit(80).get();
    const offers: Offer[] = snapshot.docs.flatMap(doc => {
      const row = doc.data();
      if (row.expiresAt !== data.expiresAt || row.availability === "out_of_stock") return [];
      if (row.pincode && row.pincode !== pin) return [];
      if (store.pinRequired && row.pincode !== pin) return [];
      if (!numericBarcode && !terms.every(term => row.tokens?.includes(term))) return [];
      return [{ id: `${id}-${doc.id}`, source: store.name, title: row.title, url: row.productUrl,
        image: row.imageUrl || undefined, price: row.price, currency: "INR",
        availability: row.availability === "in_stock" ? "In stock when feed updated" : "Stock unconfirmed",
        delivery: row.deliveryMinutes ? `Estimated ${row.deliveryMinutes} min for ${pin}` : undefined,
        deliveryMinutes: row.deliveryMinutes || undefined, deliveryFee: row.deliveryFee ?? undefined,
        observedAt: data.observedAt, origin: "partner_feed" as const }];
    });
    return { offers, status: { source: store.name, status: "feed", detail: `${offers.length} partner feed results · updated ${new Date(data.observedAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "short", timeStyle: "short" })}` } };
  } catch {
    return status("error", "Partner feed unavailable");
  }
}

export async function searchPartnerFeeds(query: string, market: string, pin: string): Promise<Result[]> {
  if (market !== "IN") return feedStoreIds.map(id => ({ offers: [], status: { source: feedStores[id].name, status: "unavailable", detail: "India only" } }));
  return Promise.all(feedStoreIds.map(id => searchStore(id, query, pin)));
}
