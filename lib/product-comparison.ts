import type { Product } from "@/lib/products"

export type ComparisonOption = { id: string; productId: string; seller: string; price: number; currency: "INR"; availability: string; delivery?: string; pickup?: string; distance?: string; fees: number; taxes: number; savings: number }

const sonyOptions: ComparisonOption[] = [
  { id: "croma", productId: "sony-wh-1000xm5", seller: "Croma", price: 4399, currency: "INR", availability: "In stock", pickup: "Pickup today", distance: "2.4 km", fees: 0, taxes: 0, savings: 300 },
  { id: "amazon", productId: "sony-wh-1000xm5", seller: "Amazon India", price: 4699, currency: "INR", availability: "In stock", delivery: "Delivery tomorrow", fees: 0, taxes: 0, savings: 0 },
  { id: "reliance", productId: "sony-wh-1000xm5", seller: "Reliance Digital", price: 4599, currency: "INR", availability: "Limited stock", delivery: "Delivery in 2 days", fees: 0, taxes: 0, savings: 100 },
]

const defaultOptions = (product: Product): ComparisonOption[] => [
  { id: `${product.id}-seller`, productId: product.id, seller: product.seller.split(" · ")[0], price: product.price, currency: "INR", availability: "In stock", delivery: product.delivery, fees: 0, taxes: 0, savings: Math.max(0, product.oldPrice - product.price) },
]

export function getComparison(product: Product) {
  const options = product.id === "sony-wh-1000xm5" ? sonyOptions : defaultOptions(product)
  return { productId: product.id, options, recommendedOptionId: options[0].id }
}

export const formatComparisonINR = (value: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value)
