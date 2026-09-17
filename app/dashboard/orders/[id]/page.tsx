import { notFound } from "next/navigation"
import { orderById, orders } from "@/lib/commerce"
import OrderDetailClient from "./order-detail-client"

export function generateStaticParams() { return orders.map(({ id }) => ({ id })) }

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = orderById(id)
  if (!order) notFound()
  return <OrderDetailClient order={order} />
}
