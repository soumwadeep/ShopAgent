export type Product = { id: string; name: string; seller: string; price: number; oldPrice: number; image: string; score: string; delivery: string }

export const products: Product[] = [
  { id: "sony-wh-1000xm5", name: "Sony WH-1000XM5", seller: "Croma · Koramangala", price: 29990, oldPrice: 34990, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=contain&w=800&h=600&q=90", score: "92", delivery: "Pickup today" },
  { id: "airpods-pro-2", name: "AirPods Pro 2nd gen", seller: "Apple Store", price: 18990, oldPrice: 24900, image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=85", score: "88", delivery: "Delivery tomorrow" },
  { id: "macbook", name: "MacBook Pro M3", seller: "Apple Store", price: 149900, oldPrice: 169900, image: "/images/macbook-pro-m3.png", score: "90", delivery: "Ships in 2 days" },
] as const
