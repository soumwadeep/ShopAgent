import { NextResponse } from "next/server"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!id) return NextResponse.json({ error: "Purchase review ID is required." }, { status: 400 })
  return NextResponse.json({ error: "Purchase couldn't be completed", reason: "Purchase approval is not connected to a merchant or payment provider yet." }, { status: 501 })
}
