import Link from "next/link"
import { products } from "@/lib/products"
import ProductDetailClient from "./product-detail-client"

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = products.find((item) => item.id === id)
  if (!product) return <main className="min-h-screen bg-[#f2f2f3] p-5 text-[#171719]"><div className="mx-auto max-w-5xl rounded-[2.4rem] bg-[#fbfbfc] p-8"><Link href="/dashboard/watchlist" className="text-sm text-[#6044d8]">Back to Saved &amp; Memory</Link><h1 className="mt-8 text-3xl font-semibold">Product not found</h1><p className="mt-2 text-sm text-black/50">This product is no longer in your saved items.</p></div></main>
  return <ProductDetailClient product={product} />
}

export function generateStaticParams() { return products.map((product) => ({ id: product.id })) }
