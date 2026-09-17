# ShopAgent

Next.js shopping agent prototype with Firebase Authentication, Firestore search history, barcode scanning, and optional official retailer product feeds.

## Run

```bash
npm install
npm run dev
```

The Firebase web project ID and public app configuration are in `lib/firebase.ts`. Enable Google and Email Link sign-in in Firebase Authentication. Add your local and deployed domains to Authentication > Settings > Authorized domains. In Firestore, publish the rules in `firestore.rules` before using account data. The rules keep user profiles and searches private to their owners.

Copy `.env.example` to `.env.local` and fill in server-side credentials for the retailers you have access to. Restart the server after changing environment variables. Never prefix these credentials with `NEXT_PUBLIC_` or put them in client code.

| Retailer | Access required | Markets in this integration |
| --- | --- | --- |
| Amazon | Approved Associates account, Creators API credential ID/secret/version, partner tag for each market | IN, US, GB |
| Flipkart | Affiliate tracking ID and API token | IN |
| eBay | Developer client ID and secret | US, GB |

ShopAgent reports a retailer as `not_connected` until its credentials or feed are present, or `error` if the official source fails. It never generates prices or stock estimates for an unconnected retailer.

## Connect the eight Indian stores

| Store | What to obtain | ShopAgent connector |
| --- | --- | --- |
| Amazon | Approved Associates account, Creators API credential ID/secret/version, India partner tag | Official API |
| Flipkart | Affiliate account, tracking ID and API token (confirm current access with Flipkart) | Official API |
| JioMart | Written catalog/data-sharing agreement and an export or partner API from JioMart | Authorized feed |
| Croma | Affiliate account for links; request a licensed catalog/price/availability export separately | Authorized feed |
| Reliance Digital | Written catalog/data-sharing agreement and export/API from its business team | Authorized feed |
| BigBasket | Partner/seller relationship and permission for a catalog export or API | Authorized feed |
| Blinkit | Brand/seller partnership and permission for a location-specific catalog export or API | Authorized feed |
| Zepto | Brand/merchant partnership and permission for a location-specific catalog export or API | Authorized feed |

Apply via [Amazon Associates / Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/onboarding/register-for-creators-api), [Flipkart Affiliate](https://affiliate.flipkart.com/api-docs/af_register.html), [JioMart Seller](https://identity.seller.jiomart.com/), [Croma Affiliate](https://www.croma.com/affiliate-faqs), [BigBasket Partner](https://www.bigbasket.com/partner/login/?type=jit), and [Blinkit Partner](https://blinkit.com/partner). For Reliance Digital, use its official [contact page](https://www.reliancedigital.in/); for Zepto, contact its official business/brand team. An affiliate link alone is **not** a catalog API. No public buyer-catalog API has been verified for the six feed stores; do not scrape sites or use their private endpoints. Their direct links remain available even without a feed.

Ask each partner for permission to display product names, images, prices, stock, and product links, including any attribution or cache limits. Request a CSV/XLSX or documented API export with stable SKU, GTIN where available, price in INR, availability, product URL, last-updated time, and serviceable PIN code. For delivery comparisons, request a PIN-specific ETA and fee, plus a refresh cadence and expiry policy. An API export can be converted to the same CSV format for scheduled imports.

### Publish an authorized feed

1. In Firebase Console > Project settings > Service accounts, generate a **server-side** service account key for this project. Store the JSON outside the repo and set `GOOGLE_APPLICATION_CREDENTIALS` in `.env.local` to its absolute path. On managed Google infrastructure, Application Default Credentials with the project ID also work; for other deployments use `FIREBASE_SERVICE_ACCOUNT_JSON` as a protected server secret. Never expose an Admin key to the browser or commit it.
2. Prepare a `.csv` or `.xlsx` file. Required columns: `sku,title,price,product_url,availability`. Location-sensitive JioMart, BigBasket, Blinkit, and Zepto also require `pincode` on every row. Optional columns: `image_url,gtin,pincode,delivery_minutes,delivery_fee`. Availability is `in_stock`, `out_of_stock`, or `unknown`. Prices and fees are INR; `delivery_minutes` must be PIN-specific. See `examples/partner-feed.csv` for **format only**; its product is fictional and must never be published.
3. Validate first: `npm run feed:import -- --source croma --file /path/to/feed.csv --dry-run`. Then publish: `npm run feed:import -- --source croma --file /path/to/feed.csv --ttl-hours 24 --observed-at 2026-09-17T08:00:00+05:30`. Source IDs are `jiomart`, `croma`, `reliance_digital`, `bigbasket`, `blinkit`, `zepto`. Omit `--observed-at` only when the export is generated at import time. TTL may be 1-168 hours; choose a shorter TTL for fast-changing inventory.
4. Repeat the import on every authorized refresh. The importer validates rows and store-domain HTTPS links before writing, replaces the store's previous products, then marks the feed ready. Search excludes expired feeds and out-of-stock products. Firestore Admin writes are server-only; client access to `retailerFeeds` is denied by `firestore.rules`. Use a trusted machine or secured job runner, not an end-user upload form.

The profile's six-digit delivery PIN filters partner offers. Without a matching PIN, location-sensitive stores show no offers. A supplied ETA sorts under “Fastest known”; other offers rank after it because no comparable delivery quote is available. Item price sorting excludes delivery fees. A PIN match does not guarantee full-address delivery or checkout price.

Barcode scanning uses the device camera in the browser. Camera permission and HTTPS or localhost are required. Scanned numbers become search queries; exact GTIN matching depends on each retailer API.

Photo search is available beside the barcode button in the Agent search box. It accepts a camera capture or JPEG/PNG/WebP upload up to 8 MB, reads packaging text with OCR, and asks the configured WebCombo endpoint to identify the product and suggest web links. The identified query is also run against connected retailer sources on the same page. AI web links are shown separately from official offers and must be checked on the destination site. Photos are processed on the server and are not saved to Firestore.

Set `OMNI_API_KEY` in `.env.local` and as a **server-only** environment variable in your deployment. The key must not use the `NEXT_PUBLIC_` prefix. Because the key was shared in a chat, rotate it in the Omni dashboard before deploying and use the replacement key. The integration uses the OpenAI-style `/v1/chat/completions` API. The endpoint currently rejects `WebCombo`; the verified defaults are `antigravity/gemini-3.7-flash-high` for image identification and `WebAppCombo` for OCR-text recovery and web links. Override them with `OMNI_VISION_MODEL` and `OMNI_WEB_MODEL` if your account offers different IDs. OCR can still form a search query without Omni when packaging text is readable. AI-suggested links are not verified product inventory. The first OCR request downloads English language data and needs outbound access plus a writable `/tmp` cache.

Delivery prices and arrival times depend on the customer's exact address and retailer account. Final basket cost and checkout are not integrated. Legacy order, recommendation, and product screens are sample UI and are labeled as such within the dashboard.

Official API references: [Amazon Creators API](https://affiliate-program.amazon.com/creatorsapi/docs/en-us/api-reference/operations/search-items), [Flipkart Affiliate API](https://affiliate.flipkart.com/api-docs/af_overview.html), [eBay Browse API](https://developer.ebay.com/develop/api/buy), [Firebase email link sign-in](https://firebase.google.com/docs/auth/web/email-link-auth).
