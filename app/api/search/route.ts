import { createRemoteJWKSet, jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";
import { searchAmazon, searchEbay, searchFlipkart, type Market } from "@/lib/retailers";
import { searchPartnerFeeds } from "@/lib/feed-search";

const keys = createRemoteJWKSet(new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"));
export async function GET(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  try { await jwtVerify(token, keys, { issuer: "https://securetoken.google.com/itsshopagent", audience: "itsshopagent", algorithms: ["RS256"] }); }
  catch { return NextResponse.json({ error: "Session expired" }, { status: 401 }); }
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const market = request.nextUrl.searchParams.get("market") ?? "IN";
  const pin = request.nextUrl.searchParams.get("pin") ?? "";
  if (query.length < 2 || query.length > 120 || !["IN", "US", "GB"].includes(market)) return NextResponse.json({ error: "Enter a search of 2-120 characters and select a market" }, { status: 400 });
  if (pin && !/^\d{6}$/.test(pin)) return NextResponse.json({ error: "Enter a six-digit delivery PIN" }, { status: 400 });
  const [amazon, flipkart, ebay, feeds] = await Promise.all([searchAmazon(query, market as Market), searchFlipkart(query, market as Market), searchEbay(query, market as Market), searchPartnerFeeds(query, market, pin)]);
  const results = [amazon, flipkart, ebay, ...feeds];
  const offers = results.flatMap(result => result.offers).sort((a, b) => {
    if (a.currency !== b.currency) return 0;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });
  return NextResponse.json({ query, market, pin, checkedAt: new Date().toISOString(), offers, sources: results.map(result => result.status) }, { headers: { "Cache-Control": "private, no-store" } });
}
