export type AgentRequest = { id: "headphones" | "macbook-work" | "goa-trip"; title: string; status: "Completed" | "In progress"; stage: "completed" | "searching" | "planning"; stageLabel: string; detail: string; value: number; recommendation?: Recommendation }
export type ShoppingRequest = AgentRequest

export const agentRequests: AgentRequest[] = [
  { id: "headphones", title: "Noise-cancelling headphones", status: "Completed", stage: "completed", stageLabel: "Best match found nearby", detail: "Completed · best match found nearby", value: 29990 },
  { id: "macbook-work", title: "MacBook for work", status: "In progress", stage: "searching", stageLabel: "Searching online + nearby", detail: "Working on it · searching online + nearby", value: 89990 },
  { id: "goa-trip", title: "Weekend trip to Goa", status: "In progress", stage: "planning", stageLabel: "Building your shopping list", detail: "Planning your trip · building your shopping list", value: 45000 },
]

export const getAgentRequest = (id?: string | null): AgentRequest => agentRequests.find(request => request.id === id) ?? agentRequests[0]
export type ShoppingAction = { id: string; title: string; detail: string; icon: "search" | "bell" | "cart"; tone: "purple" | "green" | "orange" }
export type Purchase = { id: string; name: string; store: string; price: number; status: "Delivered" | "On the way"; image: string }
export type RecommendationOption = { id: string; productId: string; product: string; seller: string; price: number; currency: "INR"; availability: string; delivery?: string; pickup?: string; distance?: string; savings: number; decisionFactors: string[]; image: string }
export type Recommendation = { name: string; merchant: string; location: string; price: number; savings: number; match: number; note: string; image: string; availability: string; recommendation: { bestMatch: RecommendationOption; alternatives: RecommendationOption[] } }


export const dashboardState = {
  budget: 150000,
  spent: 22750,
  saved: 8210,
  agentProgress: 72,
  activeRequestCount: 2,
  completedRequestCount: 1,
  requests: agentRequests,
  actions: [
    { id: "a1", title: "Found a better option", detail: "Your agent found Sony WH-1000XM5 nearby at ₹4,399 — ₹300 below the online option.", icon: "search", tone: "green" },
    { id: "a2", title: "Checking availability", detail: "ShopAgent is checking availability and fit", icon: "bell", tone: "purple" },
    { id: "a3", title: "Purchase handled", detail: "Your order from Amazon is on the way", icon: "cart", tone: "orange" },
  ] satisfies ShoppingAction[],
  purchases: [
    { id: "p1", name: "Sony WH-1000XM5", store: "Amazon", price: 29990, status: "Delivered", image: "/products/sony-headphones.jpg" },
    { id: "p2", name: "Apple Watch Series 9", store: "Apple Store", price: 41900, status: "On the way", image: "/products/apple-watch.jpg" },
  ] satisfies Purchase[],
  memory: ["Prefers value over brand", "Usually shops on weekends", "Monthly budget: ₹1,50,000"],
  recommendation: { name: "Sony WH-1000XM5", merchant: "Croma", location: "2.4 km", availability: "Pickup today", price: 4399, savings: 300, match: 94, image: "/products/sony-wh-1000xm5.png", note: "Best balance of price, availability and your preferences.", recommendation: { bestMatch: { id: "croma", productId: "sony-wh-1000xm5", product: "Sony WH-1000XM5", seller: "Croma", price: 4399, currency: "INR", availability: "In stock", pickup: "Pickup today", distance: "2.4 km", savings: 300, decisionFactors: ["Best overall value", "Pickup today", "Trusted seller"], image: "/products/sony-wh-1000xm5.png" }, alternatives: [{ id: "amazon", productId: "sony-wh-1000xm5", product: "Sony WH-1000XM5", seller: "Amazon India", price: 4699, currency: "INR", availability: "In stock", delivery: "Delivery tomorrow", savings: 0, decisionFactors: ["Fast delivery", "Online convenience"], image: "/products/sony-wh-1000xm5.png" }, { id: "reliance", productId: "sony-wh-1000xm5", product: "Sony WH-1000XM5", seller: "Reliance Digital", price: 4599, currency: "INR", availability: "Limited stock", delivery: "Delivery in 2 days", savings: 100, decisionFactors: ["Lower online price", "Delivery in 2 days"], image: "/products/sony-wh-1000xm5.png" }] } } satisfies Recommendation,
}

const inrFormatter = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 })
export const formatINR = (value: number) => inrFormatter.format(value)
export const formatCompactINR = (value: number) => value >= 100000 ? `₹${(value / 100000).toFixed(1)}L` : formatINR(value)
export const budgetPercent = Math.round((dashboardState.spent / dashboardState.budget) * 100)
export const savingsPercent = Math.round((dashboardState.saved / (dashboardState.spent + dashboardState.saved)) * 100)

export function getSavingsSeries() { return [24, 42, 36, 60, 44, 72, 54, 82, 64, 78, 68, 92] }
export function getActivitySeries() { return [38, 58, 48, 74, 62, 88, 78, 92, 68, 84, 76, 96] }
