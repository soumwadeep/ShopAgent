import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { ocrQuery } from "@/lib/product-ocr";

export const runtime = "nodejs";

const keys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
const MAX_BYTES = 8 * 1024 * 1024;
type WebLink = { title: string; url: string; snippet?: string };
type Identification = { query: string; product: string; webResults: WebLink[] };

function imageMime(bytes: Uint8Array): string | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (bytes.slice(0, 8).every((value, index) => value === [137, 80, 78, 71, 13, 10, 26, 10][index])) return "image/png";
  if (Buffer.from(bytes.subarray(0, 4)).toString() === "RIFF" && Buffer.from(bytes.subarray(8, 12)).toString() === "WEBP") return "image/webp";
  return null;
}

function publicUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !url.hostname.includes(".") || /^(localhost|.*\.local|.*\.internal)$/.test(url.hostname) || /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) || url.username || url.password) return null;
    return url.toString();
  } catch { return null; }
}

function parseIdentification(content: unknown): Identification | null {
  const text = typeof content === "string" ? content : Array.isArray(content) ? content.filter(part => part?.type === "text").map(part => part.text).join("\n") : "";
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let data: Record<string, unknown>;
  try { data = JSON.parse(cleaned); } catch { return null; }
  const query = typeof data.query === "string" ? data.query.trim().slice(0, 120) : "";
  if (query.length < 2) return null;
  const product = typeof data.product === "string" ? data.product.trim().slice(0, 160) : query;
  const links = Array.isArray(data.webResults) ? data.webResults : [];
  const seen = new Set<string>();
  const webResults: WebLink[] = links.flatMap(item => {
    const url = publicUrl(typeof item === "string" ? item : item?.url);
    if (!url || seen.has(url)) return [];
    seen.add(url);
    return [{ title: typeof item?.title === "string" ? item.title.slice(0, 100) : new URL(url).hostname, url, snippet: typeof item?.snippet === "string" ? item.snippet.slice(0, 240) : undefined }];
  }).slice(0, 6);
  return { query, product, webResults };
}

async function askOmni(model: string, prompt: string, image?: { mime: string; bytes: Buffer }): Promise<Identification | null> {
  const key = process.env.OMNI_API_KEY;
  if (!key) return null;
  const content = image ? [
    { type: "text", text: prompt },
    { type: "image_url", image_url: { url: `data:${image.mime};base64,${image.bytes.toString("base64")}` } },
  ] : prompt;
  const response = await fetch("https://omni.soumwadeepguha.com/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 900, messages: [{ role: "user", content }] }),
    signal: AbortSignal.timeout(image ? 20000 : 30000),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Provider HTTP ${response.status}`);
  const data = await response.json();
  return parseIdentification(data.choices?.[0]?.message?.content);
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  try { await jwtVerify(token, keys, { issuer: "https://securetoken.google.com/itsshopagent", audience: "itsshopagent", algorithms: ["RS256"] }); }
  catch { return NextResponse.json({ error: "Session expired" }, { status: 401 }); }

  let image: File | null;
  try { image = (await request.formData()).get("image") as File | null; }
  catch { return NextResponse.json({ error: "Could not read the photo" }, { status: 400 }); }
  if (!(image instanceof File) || image.size < 100 || image.size > MAX_BYTES) return NextResponse.json({ error: "Choose a photo smaller than 8 MB" }, { status: 400 });
  const uploaded = Buffer.from(await image.arrayBuffer());
  if (!imageMime(uploaded)) return NextResponse.json({ error: "Use a JPEG, PNG, or WebP photo" }, { status: 400 });
  let bytes: Buffer;
  try { bytes = await sharp(uploaded, { limitInputPixels: 25_000_000 }).rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 88 }).toBuffer(); }
  catch { return NextResponse.json({ error: "Could not process this photo. Try a clearer JPEG, PNG, or WebP image." }, { status: 400 }); }
  const mime = "image/jpeg";

  let extractedText = "";
  try {
    const { createWorker, PSM } = await import("tesseract.js");
    const worker = await createWorker("eng", undefined, { cachePath: "/tmp" });
    try {
      const { width = 0, height = 0 } = await sharp(bytes).metadata();
      if (width >= 200 && height >= 200) {
        const crop = await sharp(bytes).extract({ left: Math.floor(width * 0.32), top: Math.floor(height * 0.29), width: Math.floor(width * 0.36), height: Math.floor(height * 0.22) }).resize({ width: 1200 }).grayscale().normalize().sharpen().png().toBuffer();
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
        extractedText = (await worker.recognize(crop)).data.text.trim();
      }
      await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
      extractedText = `${extractedText}\n${(await worker.recognize(bytes)).data.text}`.trim().slice(0, 1800);
    }
    finally { await worker.terminate(); }
  } catch { /* Visual identification can still succeed when the OCR language data is unavailable. */ }

  const prompt = `Identify the retail product shown in this photo. OCR text: ${JSON.stringify(extractedText)}. Use the image and OCR to identify brand, variant, model, size or barcode where possible. Ignore promotional slogans and ingredients unless part of the product name. Return ONLY JSON with keys "product" (short brand + product label), "query" (concise brand + variant/model search phrase), and "webResults" (empty array). Never invent prices or stock.`;
  let match: Identification | null = null;
  let method: "vision" | "ocr_ai" | "ocr_only" = "ocr_only";
  if (process.env.OMNI_API_KEY) {
    const visionModel = process.env.OMNI_VISION_MODEL || "antigravity/gemini-3.7-flash-high";
    const webModel = process.env.OMNI_WEB_MODEL || "WebAppCombo";
    try { match = await askOmni(visionModel, prompt, { mime, bytes }); if (match) method = "vision"; }
    catch { /* OCR and the web model can still identify printed packaging. */ }
    if (!match && extractedText) {
      try { match = await askOmni(webModel, `Identify the retail product from this OCR text: ${JSON.stringify(extractedText)}. Ignore slogans and ingredients; use the distinctive brand and variant. Return ONLY JSON with keys "product", "query" (short brand + variant), and "webResults" (up to 6 real product-page links as objects with title, https url and snippet). Do not invent prices or stock.`); if (match) method = "ocr_ai"; }
      catch { /* OCR still provides a useful local fallback. */ }
    }
    if (match && method === "vision") {
      try {
        const web = await askOmni(webModel, `Find product-page links for ${JSON.stringify(match.query)}. Return ONLY JSON with keys "product", "query", and "webResults" (up to 6 objects with title, https url and short snippet). Do not invent prices, availability, or links.`);
        if (web?.webResults.length) match.webResults = web.webResults;
      } catch { /* Product identification remains useful without web links. */ }
    }
  }
  if (!match) {
    const query = ocrQuery(extractedText);
    if (!query) return NextResponse.json({ error: process.env.OMNI_API_KEY ? "Couldn't identify the product. Try a clearer photo with visible packaging text." : "Photo search needs OMNI_API_KEY or readable packaging text." }, { status: 422 });
    match = { product: query, query, webResults: [] };
  }
  return NextResponse.json({ ...match, extractedText, method, checkedAt: new Date().toISOString() }, { headers: { "Cache-Control": "private, no-store" } });
}
