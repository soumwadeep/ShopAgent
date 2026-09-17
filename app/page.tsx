import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Grid2X2,
  Headphones,
  House,
  Plane,
  Shirt,
  ShoppingCart,
  Sparkles,
  Utensils,
} from "lucide-react";
import { ShopAgentHero } from "@/components/shopagent-hero";

const intelligenceProducts = [
  {
    id: "sony-wh-1000xm5",
    label: "Best match",
    name: "Sony WH-1000XM5",
    seller: "Croma · Koramangala",
    price: "₹29,990",
    image: "/images/shopagent-headphones.png",
  },
  {
    id: "nike-sneakers",
    label: "Smart value",
    name: "Nike Air Max 270",
    seller: "Nike Official",
    price: "₹8,495",
    image: "/images/shopagent-sneaker.png",
  },
  {
    id: "groceries",
    label: "Fastest option",
    name: "Weekly groceries",
    seller: "Nearby supermarket · Online",
    price: "₹1,240",
    image: "/images/shopagent-grocery-card.png",
  },
];
const collections = [
  [
    "Everyday groceries",
    "Build your basket and compare nearby supermarkets with online options.",
    "/images/shopagent-grocery-card.png",
  ],
  [
    "Fashion for everyone",
    "Explore clothing, footwear and accessories for men, women and kids.",
    "/images/shopagent-fashion-card.png",
  ],
  [
    "Home essentials",
    "Find everyday household essentials from local stores and online retailers.",
    "/images/shopagent-home-card.png",
  ],
];
const categories = [
  ["Electronics", Headphones],
  ["Fashion", Shirt],
  ["Groceries", ShoppingCart],
  ["Home", House],
  ["Beauty", Sparkles],
  ["Travel", Plane],
  ["Everyday", Grid2X2],
  ["Food", Utensils],
] as const;

function ShoppingSections() {
  return (
    <>
      <section
        id="collections"
        className="bg-card px-5 py-14 text-card-foreground sm:px-10 lg:px-16 lg:py-20"
      >
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Shopping intelligence in action
            </p>
            <h2 className="mt-4 max-w-xl text-5xl font-semibold leading-none tracking-tighter sm:text-7xl">
              Good options.
              <br />
              Clear reasons.
            </h2>
          </div>
          <Link
            href="/dashboard"
            className="hidden rounded-full border px-4 py-2 text-sm font-semibold sm:block"
          >
            Explore agent shop{" "}
            <ArrowUpRight size={16} className="ml-1 inline" />
          </Link>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {intelligenceProducts.map((product) => (
            <Link
              href={
                product.id === "sony-wh-1000xm5"
                  ? `/products/${product.id}`
                  : `/dashboard/agent?q=${encodeURIComponent(product.name)}`
              }
              key={product.id}
              className="group overflow-hidden rounded-3xl bg-background p-3 text-foreground"
            >
              <div className="relative aspect-[1.6] overflow-hidden rounded-2xl bg-card text-card-foreground">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-contain p-5"
                />
                <span className="absolute left-3 top-3 z-10 rounded-full bg-card/95 px-3 py-1 text-sm font-medium text-card-foreground shadow-sm">
                  {product.label}
                </span>
                <span className="absolute bottom-3 right-3 grid size-10 place-items-center rounded-full bg-foreground text-background">
                  <ArrowUpRight size={20} />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 p-3">
                <div>
                  <h3 className="text-base font-semibold">{product.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {product.seller}
                  </p>
                </div>
                <p className="font-semibold">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="bg-muted px-5 py-14 text-foreground sm:px-10 lg:px-16 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Curated for every need
            </p>
            <h2 className="mt-6 text-5xl font-semibold leading-none tracking-tighter sm:text-7xl">
              Find what
              <br />
              you need next.
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-muted-foreground">
              From daily essentials to lifestyle upgrades, ShopAgent helps you
              discover the best options across online and nearby stores.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {collections.map(([title, body, image]) => (
              <Link
                href={`/dashboard/agent?q=${encodeURIComponent(title)}`}
                key={title}
                className="relative min-h-80 overflow-hidden rounded-3xl bg-card p-5 text-card-foreground"
              >
                <img
                  src={image}
                  alt={title}
                  loading="lazy"
                  className="absolute bottom-0 right-0 h-[58%] w-full object-cover"
                />
                <div className="relative z-10">
                  <h3 className="text-xl font-semibold leading-tight">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {body}
                  </p>
                </div>
                <span className="absolute bottom-4 left-4 grid size-10 place-items-center rounded-full bg-card text-card-foreground">
                  <ArrowUpRight size={20} />
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {categories.map(([category, Icon]) => (
            <Link
              href={`/dashboard/agent?q=${encodeURIComponent(`Help me shop for ${category.toLowerCase()}`)}`}
              key={category}
              className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-medium text-card-foreground"
            >
              <Icon size={19} strokeWidth={1.8} className="text-primary" />
              {category}
            </Link>
          ))}
        </div>
      </section>
      <section
        id="how-it-works"
        className="grid gap-10 bg-background px-5 py-16 text-foreground sm:px-10 lg:grid-cols-[.8fr_1.2fr] lg:px-16"
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            How it works
          </p>
          <h2 className="mt-4 max-w-lg text-5xl font-semibold leading-none tracking-tighter sm:text-7xl">
            Shopping,
            <br />
            rethought.
          </h2>
          <p className="mt-6 max-w-sm leading-relaxed text-muted-foreground">
            The agent does the legwork. You stay in control of the decision.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            [
              "01",
              "Ask naturally",
              "Tell us what you need, where you are, and what matters.",
            ],
            [
              "02",
              "Compare clearly",
              "We surface options with the details behind every choice.",
            ],
            [
              "03",
              "Approve confidently",
              "You choose the next step. Nothing happens without you.",
            ],
          ].map(([number, title, body]) => (
            <div
              key={number}
              className="rounded-3xl bg-card p-5 text-card-foreground"
            >
              <span className="text-sm font-semibold text-primary">
                {number}
              </span>
              <h3 className="mt-20 text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {body}
              </p>
              <Check size={20} className="mt-8 text-primary" />
            </div>
          ))}
        </div>
      </section>
      <section
        id="pricing"
        className="bg-background px-5 py-16 text-foreground sm:px-10 lg:px-16 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">
              Pricing
            </p>
            <h2 className="mt-5 max-w-lg text-5xl font-semibold leading-[.95] tracking-tighter sm:text-7xl">
              Simple pricing.
              <br />
              Built around
              <br />
              how you shop.
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-muted-foreground">
              Start free and experience your personal shopping agent. More
              advanced shopping capabilities will be introduced as ShopAgent
              evolves.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="flex flex-col rounded-3xl border-2 border-primary/35 bg-card p-6 text-card-foreground shadow-[0_14px_35px_color-mix(in_srgb,var(--primary)_10%,transparent)]">
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Free
              </p>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight">
                Explore ShopAgent
              </h3>
              <p className="mt-2 text-muted-foreground">
                Get started. No commitments.
              </p>
              <ul className="mt-7 grid gap-4 text-sm">
                {[
                  "Ask the agent",
                  "Discover products",
                  "Compare options",
                  "Online + nearby discovery",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check size={15} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/agent"
                className="mt-8 flex items-center justify-center rounded-full bg-primary px-5 py-3 font-semibold text-primary-foreground"
              >
                Start shopping <ArrowUpRight size={18} className="ml-2" />
              </Link>
            </div>
            <div className="rounded-3xl border bg-card p-6 text-card-foreground">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Agent
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Coming soon
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">
                More shopping
                <br />
                intelligence
              </h3>
              <p className="mt-2 text-muted-foreground">
                For deeper assistance.
              </p>
              <ul className="mt-7 grid gap-4 text-sm">
                {[
                  "Personalized shopping intelligence",
                  "Basket optimization",
                  "Deeper recommendations",
                  "Shopping memory",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check size={15} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-3xl border bg-card p-6 text-card-foreground">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  Delegate
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
                  Coming soon
                </span>
              </div>
              <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight">
                Let your agent
                <br />
                handle more
              </h3>
              <p className="mt-2 text-muted-foreground">
                For a more hands-off experience.
              </p>
              <ul className="mt-7 grid gap-4 text-sm">
                {[
                  "Approval-based purchasing",
                  "Delegated shopping",
                  "Advanced spending guardrails",
                  "Post-purchase assistance",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                      <Check size={15} />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-sm text-muted-foreground">
          Pricing will be transparent before any paid feature is activated.
        </p>
      </section>
      <section className="flex flex-col items-center bg-muted px-5 py-16 text-center text-foreground sm:px-10">
        <p className="rounded-full bg-card px-3 py-1 text-sm font-semibold text-primary">
          Simple by design
        </p>
        <h2 className="mt-5 text-5xl font-semibold tracking-tighter sm:text-7xl">
          Your best choice
          <br />
          should be obvious.
        </h2>
        <p className="mt-5 max-w-md leading-relaxed text-muted-foreground">
          Start free. Ask anything. Discover a clearer way to shop.
        </p>
        <Link
          href="/dashboard/agent"
          className="mt-7 rounded-full bg-foreground px-6 py-3 font-semibold text-background"
        >
          Start shopping <ArrowUpRight size={18} className="ml-1 inline" />
        </Link>
      </section>
      <footer className="border-t bg-background px-5 pb-6 pt-12 text-foreground sm:px-10 sm:pt-16 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr_1fr_1.1fr]">
          <div>
            <Link href="/" className="text-xl font-semibold tracking-tight">
              ShopAgent <span className="font-normal text-primary">AI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your personal shopping agent for clearer choices, better
              comparisons, and more confident decisions.
            </p>
            <Link
              href="/dashboard/agent"
              className="mt-6 inline-flex items-center rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background"
            >
              Ask the agent <ArrowUpRight size={16} className="ml-2" />
            </Link>
          </div>
          <div>
            <p className="text-sm font-semibold">Explore</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <Link
                href="#collections"
                className="transition-colors hover:text-foreground"
              >
                Collections
              </Link>
              <Link
                href="#how-it-works"
                className="transition-colors hover:text-foreground"
              >
                How it works
              </Link>
              <Link
                href="#pricing"
                className="transition-colors hover:text-foreground"
              >
                Pricing
              </Link>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold">Shop by need</p>
            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <Link
                href="/dashboard/agent?q=electronics"
                className="transition-colors hover:text-foreground"
              >
                Electronics
              </Link>
              <Link
                href="/dashboard/agent?q=fashion"
                className="transition-colors hover:text-foreground"
              >
                Fashion
              </Link>
              <Link
                href="/dashboard/agent?q=groceries"
                className="transition-colors hover:text-foreground"
              >
                Groceries
              </Link>
            </div>
          </div>
          <div className="rounded-2xl bg-muted p-5">
            <p className="text-sm font-semibold">A smarter way to shop</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Tell us what you need. We&apos;ll help you find the best options.
            </p>
            <Link
              href="/dashboard/agent"
              className="mt-4 inline-flex items-center text-sm font-semibold text-primary"
            >
              Start free <ArrowUpRight size={15} className="ml-1" />
            </Link>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 ShopAgent AI. Your decisions. Better supported.</span>
          <span>Made for better everyday choices.</span>
        </div>
      </footer>
    </>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background font-sans text-foreground">
      <ShopAgentHero />
      <ShoppingSections />
    </main>
  );
}
