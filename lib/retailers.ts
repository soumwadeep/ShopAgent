export type Market = "IN" | "US" | "GB";
export type Offer = {
  id: string;
  source: string;
  title: string;
  url: string;
  image?: string;
  price?: number;
  currency?: string;
  delivery?: string;
  availability?: string;
  deliveryMinutes?: number;
  deliveryFee?: number;
  observedAt?: string;
  origin?: "partner_feed";
};
export type SourceStatus = { source: string; status: "live" | "feed" | "not_connected" | "unavailable" | "error"; detail: string };
type Result = { offers: Offer[]; status: SourceStatus };

const okayUrl = (value: unknown, host: RegExp) => {
  if (typeof value !== "string") return "";
  try { const url = new URL(value); return url.protocol === "https:" && host.test(url.hostname) ? value : ""; } catch { return ""; }
};
const number = (value: unknown) => typeof value === "number" && Number.isFinite(value) ? value : undefined;

export async function searchFlipkart(query: string, market: Market): Promise<Result> {
  const id = process.env.FLIPKART_AFFILIATE_ID;
  const token = process.env.FLIPKART_AFFILIATE_TOKEN;
  if (market !== "IN") return { offers: [], status: { source: "Flipkart", status: "unavailable", detail: "India only" } };
  if (!id || !token) return { offers: [], status: { source: "Flipkart", status: "not_connected", detail: "Affiliate credentials needed" } };
  try {
    const url = new URL("https://affiliate-api.flipkart.net/affiliate/1.0/search.json");
    url.searchParams.set("query", query); url.searchParams.set("resultCount", "10");
    const response = await fetch(url, { headers: { "Fk-Affiliate-Id": id, "Fk-Affiliate-Token": token }, signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const offers: Offer[] = (data.productInfoList ?? []).flatMap((entry: any) => {
      const product = entry.productBaseInfoV1;
      const url = okayUrl(product?.productUrl, /(^|\.)flipkart\.com$/);
      if (!url || !product?.title) return [];
      return [{ id: `flipkart-${product.productId}`, source: "Flipkart", title: product.title, url,
        image: okayUrl(product.imageUrls?.["200x200"] ?? product.imageUrls?.["400x400"], /(^|\.)flixcart\.com$|(^|\.)flipkart\.com$/),
        price: number(product.flipkartSellingPrice?.amount), currency: product.flipkartSellingPrice?.currency ?? "INR",
        availability: product.inStock ? "In stock" : "Stock unconfirmed" }];
    });
    return { offers, status: { source: "Flipkart", status: "live", detail: `${offers.length} official results` } };
  } catch { return { offers: [], status: { source: "Flipkart", status: "error", detail: "Official API unavailable" } }; }
}

const amazonTokens: Partial<Record<Market, { value: string; expires: number }>> = {};
export async function searchAmazon(query: string, market: Market): Promise<Result> {
  const id = process.env.AMAZON_CREATORS_CLIENT_ID;
  const secret = process.env.AMAZON_CREATORS_CLIENT_SECRET;
  const version = process.env.AMAZON_CREATORS_CREDENTIAL_VERSION;
  const tag = process.env[`AMAZON_PARTNER_TAG_${market}`];
  if (!id || !secret || !tag || !version) return { offers: [], status: { source: "Amazon", status: "not_connected", detail: "Creators API credentials, version, and market tag needed" } };
  const marketplace = { IN: "www.amazon.in", US: "www.amazon.com", GB: "www.amazon.co.uk" }[market];
  const authUrl = { "3.1": "https://api.amazon.com/auth/o2/token", "3.2": "https://api.amazon.co.uk/auth/o2/token", "3.3": "https://api.amazon.co.jp/auth/o2/token" }[version];
  if (!authUrl) return { offers: [], status: { source: "Amazon", status: "error", detail: "Unsupported Creators API credential version" } };
  try {
    if (!amazonTokens[market] || amazonTokens[market].expires < Date.now()) {
      const authResponse = await fetch(authUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ grant_type: "client_credentials", client_id: id, client_secret: secret, scope: "creatorsapi::default" }), signal: AbortSignal.timeout(8000), cache: "no-store" });
      if (!authResponse.ok) throw new Error("Amazon authentication failed");
      const tokenData = await authResponse.json();
      amazonTokens[market] = { value: tokenData.access_token, expires: Date.now() + Math.max(60, tokenData.expires_in - 60) * 1000 };
    }
    const response = await fetch("https://creatorsapi.amazon/catalog/v1/searchItems", { method: "POST", headers: { Authorization: `Bearer ${amazonTokens[market].value}`, "Content-Type": "application/json", "x-marketplace": marketplace }, body: JSON.stringify({ keywords: query, marketplace, partnerTag: tag, itemCount: 10, resources: ["images.primary.medium", "itemInfo.title", "offersV2.listings.price", "offersV2.listings.availability"] }), signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const offers: Offer[] = (data.searchResult?.items ?? []).flatMap((item: any) => {
      const url = okayUrl(item.detailPageURL, /(^|\.)amazon\.(in|com|co\.uk)$/);
      const title = item.itemInfo?.title?.displayValue;
      if (!url || !title) return [];
      const listing = item.offersV2?.listings?.[0];
      return [{ id: `amazon-${market}-${item.asin}`, source: "Amazon", title, url,
        image: okayUrl(item.images?.primary?.medium?.url, /(^|\.)media-amazon\.com$|(^|\.)images-amazon\.com$/),
        price: number(listing?.price?.money?.amount), currency: listing?.price?.money?.currency,
        availability: listing?.availability?.type === "IN_STOCK" ? "In stock" : "Stock unconfirmed" }];
    });
    return { offers, status: { source: "Amazon", status: "live", detail: `${offers.length} official results` } };
  } catch { return { offers: [], status: { source: "Amazon", status: "error", detail: "Official API unavailable" } }; }
}

export async function searchEbay(query: string, market: Market): Promise<Result> {
  if (market === "IN") return { offers: [], status: { source: "eBay", status: "unavailable", detail: "No India marketplace in this integration" } };
  const id = process.env.EBAY_CLIENT_ID;
  const secret = process.env.EBAY_CLIENT_SECRET;
  if (!id || !secret) return { offers: [], status: { source: "eBay", status: "not_connected", detail: "Developer credentials needed" } };
  try {
    const credentials = Buffer.from(`${id}:${secret}`).toString("base64");
    const authResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", { method: "POST", headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/x-www-form-urlencoded" }, body: "grant_type=client_credentials&scope=https%3A%2F%2Fapi.ebay.com%2Foauth%2Fapi_scope", signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!authResponse.ok) throw new Error("eBay authentication failed");
    const { access_token } = await authResponse.json();
    const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
    url.searchParams.set(/^\d{8}$|^\d{12,14}$/.test(query) ? "gtin" : "q", query);
    url.searchParams.set("limit", "10");
    const response = await fetch(url, { headers: { Authorization: `Bearer ${access_token}`, "X-EBAY-C-MARKETPLACE-ID": market === "GB" ? "EBAY_GB" : "EBAY_US" }, signal: AbortSignal.timeout(8000), cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const offers: Offer[] = (data.itemSummaries ?? []).flatMap((item: any) => {
      const url = okayUrl(item.itemWebUrl, /(^|\.)ebay\.(com|co\.uk)$/);
      if (!url || !item.title) return [];
      return [{ id: `ebay-${item.itemId}`, source: "eBay", title: item.title, url,
        image: okayUrl(item.image?.imageUrl, /(^|\.)ebayimg\.com$/), price: number(Number(item.price?.value)), currency: item.price?.currency,
        delivery: item.shippingOptions?.[0]?.minEstimatedDeliveryDate ? `From ${new Date(item.shippingOptions[0].minEstimatedDeliveryDate).toLocaleDateString("en", { day: "numeric", month: "short" })}` : undefined,
        availability: "See seller listing" }];
    });
    return { offers, status: { source: "eBay", status: "live", detail: `${offers.length} official results` } };
  } catch { return { offers: [], status: { source: "eBay", status: "error", detail: "Official API unavailable" } }; }
}
