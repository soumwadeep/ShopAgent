"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { products } from "@/lib/products";
import {
  Activity,
  ArrowLeft,
  Bell,
  Bot,
  Clock3,
  Heart,
  Home,
  Menu,
  Search,
  Send,
  Settings,
  ShoppingBag,
  Sparkles,
  UserRound,
} from "lucide-react";

const links = [
  ["/dashboard", "Dashboard", Home],
  ["/dashboard/agent", "Agent", Sparkles],
  ["/dashboard/activity", "Shopping Intelligence", Activity],
  ["/dashboard/watchlist", "Saved & Memory", Heart],
  ["/dashboard/orders", "Orders", ShoppingBag],
  ["/dashboard/settings", "Settings", Settings],
] as const;

export function Shell({
  children,
  title = "ShopAgent AI",
  back = false,
}: {
  children: React.ReactNode;
  title?: string;
  back?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState<
    "search" | "notifications" | "profile" | null
  >(null);
  const [query, setQuery] = useState("");
  const [read, setRead] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open === "search") searchRef.current?.focus();
  }, [open]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) =>
      event.key === "Escape" && setOpen(null);
    const onClick = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node))
        setOpen(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);
  const searchResults = query.trim()
    ? [
        ...products
          .filter((product) =>
            product.name.toLowerCase().includes(query.toLowerCase()),
          )
          .map((product) => ({
            label: product.name,
            detail: `Product · ₹${product.price.toLocaleString("en-IN")}`,
            href: `/products/${product.id}`,
          })),
        {
          label: "My recent orders",
          detail: "Orders · Sony WH-1000XM5 arriving tomorrow",
          href: "/dashboard/orders",
        },
        {
          label: "Weekend trip to Goa",
          detail: "Shopping goal · In progress",
          href: "/dashboard/agent",
        },
      ].filter((result) =>
        `${result.label} ${result.detail}`
          .toLowerCase()
          .includes(query.toLowerCase()),
      )
    : [];
  const toggle = (next: "search" | "notifications" | "profile") =>
    setOpen((current) => (current === next ? null : next));
  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#19191b]">
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-black/[.07] bg-white px-5 py-7 lg:flex lg:flex-col">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 text-xl font-semibold tracking-[-.04em]"
        >
          <span className="grid size-9 place-items-center rounded-xl bg-[#171719] text-white">
            <Sparkles size={17} />
          </span>
          ShopAgent<span className="text-[#7d5cff]">AI</span>
        </Link>
        <p className="mb-3 mt-12 px-3 text-[10px] font-bold uppercase tracking-[.18em] text-black/35">
          Workspace
        </p>
        <nav className="space-y-1">
          {links.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition hover:bg-[#f4f2ff] hover:text-black ${pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`)) ? "bg-[#fbfaff] text-black" : "text-black/60"}`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-[#171719] p-4 text-white">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <span className="size-2 rounded-full bg-emerald-400" />
            Agent online
          </div>
          <p className="mt-2 text-xs leading-5 text-white/55">
            Working across your active shopping requests.
          </p>
          <span className="mt-4 block rounded-lg bg-white px-3 py-2 text-center text-xs font-semibold text-black">
            Agent ready
          </span>
        </div>
      </aside>
      <main className="lg:pl-64">
        <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-black/[.06] bg-white/85 px-5 backdrop-blur md:px-10">
          <div className="flex items-center gap-3">
            {back ? (
              <Link
                href="/dashboard"
                aria-label="Back"
                className="grid size-9 place-items-center rounded-full border border-black/10"
              >
                <ArrowLeft size={17} />
              </Link>
            ) : (
              <button
                onClick={() => toggle("profile")}
                className="lg:hidden"
                aria-label="Open menu"
                aria-expanded={open === "profile"}
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <p className="text-[11px] text-black/45">
                {title === "ShopAgent AI"
                  ? "Tuesday, 13 September"
                  : "AI assistant"}
              </p>
              <h1 className="text-base font-semibold tracking-[-.02em]">
                {title}
              </h1>
            </div>
          </div>
          <div ref={panelRef} className="relative flex items-center gap-3">
            <Link href="/" aria-label="Main home" title="Main home" className="grid size-9 place-items-center rounded-full border border-black/10 hover:bg-black/5">
              <Home size={17} />
            </Link>
            <button
              onClick={() => toggle("search")}
              className="hidden rounded-full border border-black/10 p-2.5 sm:block"
              aria-label="Search"
              aria-expanded={open === "search"}
            >
              <Search size={17} />
            </button>
            <button
              onClick={() => toggle("notifications")}
              className="relative grid size-9 place-items-center rounded-full border border-black/10"
              aria-label="Notifications"
              aria-expanded={open === "notifications"}
            >
              <Bell size={17} />
              {!read && (
                <span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-[#7d5cff]" />
              )}
            </button>
            <button
              onClick={() => toggle("profile")}
              className="hidden size-9 place-items-center rounded-full bg-[#e9e4ff] text-xs font-bold text-[#6044d8] sm:grid"
              aria-label="Open profile"
              aria-expanded={open === "profile"}
            >
              AS
            </button>
            {open && (
              <div className="absolute right-0 top-12 z-30 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_60px_rgba(25,25,27,.16)]">
                {open === "search" && (
                  <div>
                    <p className="text-sm font-semibold">Search ShopAgent</p>
                    <p className="mt-1 text-xs text-black/45">
                      Find products, orders, and shopping goals.
                    </p>
                    <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#cfc3ff] px-3 py-2">
                      <Search size={16} className="text-[#7d5cff]" />
                      <input
                        ref={searchRef}
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search products, orders, or shopping goals..."
                        className="min-w-0 flex-1 bg-transparent text-xs outline-none"
                      />
                    </div>
                    {query && (
                      <div className="mt-3 space-y-1">
                        {searchResults.length ? (
                          searchResults.map((result) => (
                            <button
                              key={result.label}
                              onClick={() => router.push(result.href)}
                              className="block w-full rounded-xl px-3 py-2 text-left hover:bg-[#f5f2ff]"
                            >
                              <p className="text-xs font-semibold">
                                {result.label}
                              </p>
                              <p className="mt-1 text-[11px] text-black/45">
                                {result.detail}
                              </p>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-4 text-center text-xs text-black/45">
                            No matching ShopAgent results.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {open === "notifications" && (
                  <div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">Notifications</p>
                      <button
                        onClick={() => setRead(true)}
                        className="text-[11px] text-[#6044d8]"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="mt-3 space-y-1">
                      {[
                        [
                          "Sony WH-1000XM5",
                          "Your order is arriving tomorrow.",
                          "Just now",
                        ],
                        [
                          "Shopping recommendation",
                          "ShopAgent found a better option. Save ₹300 nearby.",
                          "10 min ago",
                        ],
                        [
                          "Weekly groceries",
                          "Your quick delivery order is on the way.",
                          "Today",
                        ],
                      ].map(([label, detail, time], index) => (
                        <div
                          key={label}
                          className="flex gap-3 rounded-xl p-3 hover:bg-[#f7f5ff]"
                        >
                          <span
                            className={`mt-1 size-2 shrink-0 rounded-full ${!read && index < 2 ? "bg-[#7d5cff]" : "bg-black/10"}`}
                          />
                          <div>
                            <p className="text-xs font-semibold">{label}</p>
                            <p className="mt-1 text-[11px] leading-4 text-black/50">
                              {detail}
                            </p>
                            <p className="mt-1 text-[10px] text-black/35">
                              {time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {open === "profile" && (
                  <div>
                    <div className="border-b border-black/[.07] pb-3">
                      <p className="text-sm font-semibold">AS</p>
                      <p className="mt-1 text-xs text-black/60">Alex</p>
                      <p className="mt-1 text-[11px] text-black/40">
                        Personal ShopAgent account
                      </p>
                    </div>
                    <nav className="mt-2 space-y-1">
                      {[
                        ["Profile", "/dashboard/settings"],
                        ["Settings", "/dashboard/settings"],
                        ["Saved & Memory", "/dashboard/watchlist"],
                        ["Orders", "/dashboard/orders"],
                      ].map(([label, href]) => (
                        <button
                          key={label}
                          onClick={() => router.push(href)}
                          className="block w-full rounded-lg px-2 py-2 text-left text-xs hover:bg-[#f5f2ff]"
                        >
                          {label}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          setOpen(null);
                          router.replace("/");
                        }}
                        className="block w-full rounded-lg px-2 py-2 text-left text-xs text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>
        {children}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 z-20 flex justify-around border-t border-black/[.07] bg-white/95 px-2 py-3 backdrop-blur lg:hidden">
        {links.map(([href, label, Icon]) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 text-[10px] text-black/50"
          >
            <Icon size={18} />
            <span>{label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: (typeof products)[number];
  compact?: boolean;
}) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group min-w-0 overflow-hidden rounded-2xl border border-black/[.07] bg-white transition hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative">
        <div
          className={`${compact ? "h-32" : "h-44"} w-full overflow-hidden bg-[#f1f1f3]`}
        >
          <img
            src={product.image}
            alt={product.name}
            className="size-full object-cover"
          />
        </div>
        <span className="absolute right-2 top-2 rounded-full bg-black px-2 py-1 text-[10px] font-bold text-white">
          -{Math.round((1 - product.price / product.oldPrice) * 100)}%
        </span>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <Heart size={15} className="shrink-0 text-black/35" />
        </div>
        <p className="mt-1 text-xs text-black/45">★ 4.8 (196)</p>
        <div className="mt-2 flex items-end justify-between">
          <p className="text-base font-bold">
            ₹{product.price.toLocaleString("en-IN")}
          </p>
          <p className="text-[10px] text-black/35 line-through">
            ₹{product.oldPrice.toLocaleString("en-IN")}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function ChatComposer() {
  const [value, setValue] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <div className="rounded-2xl border border-[#cfc3ff] bg-white p-3 shadow-sm">
      <div className="flex items-center gap-3">
        <Sparkles size={17} className="text-[#7d5cff]" />
        <input
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setSent(false);
          }}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.nativeEvent.isComposing &&
              e.keyCode !== 229 &&
              value.trim()
            )
              setSent(true);
          }}
          placeholder="Tell me what you need, where you are, and your budget..."
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
        <button
          onClick={() => value.trim() && setSent(true)}
          className="grid size-10 place-items-center rounded-full bg-[#7d5cff] text-white"
          aria-label="Send"
        >
          <Send size={17} />
        </button>
      </div>
      {sent && (
        <p className="mt-2 rounded-lg bg-[#f4f1ff] px-3 py-2 text-xs text-[#6044d8]">
          Got it. I&apos;ll check online and nearby, compare the options, and
          ask before I buy anything.
        </p>
      )}
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  children,
  action,
}: {
  eyebrow?: string;
  children: React.ReactNode;
  action?: string;
}) {
  return (
    <div className="flex items-end justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[.16em] text-[#7d5cff]">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold tracking-[-.04em] md:text-2xl">
          {children}
        </h2>
      </div>
      {action && (
        <span className="text-xs font-medium text-black/45">{action}</span>
      )}
    </div>
  );
}

export function Stats() {
  return (
    <div className="grid grid-cols-3 divide-x divide-white/15 rounded-3xl bg-[#171719] p-5 text-white">
      <div>
        <p className="text-2xl font-semibold">12</p>
        <p className="mt-1 text-[11px] text-white/55">Requests handled</p>
      </div>
      <div className="pl-4">
        <p className="text-2xl font-semibold">₹8.2k</p>
        <p className="mt-1 text-[11px] text-white/55">Saved for you</p>
      </div>
      <div className="pl-4">
        <p className="text-2xl font-semibold">2</p>
        <p className="mt-1 text-[11px] text-white/55">Awaiting approval</p>
      </div>
    </div>
  );
}

export const categories = ["Electronics", "Home", "Gifts", "Work", "Travel"];
export function CategoryRow() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-1">
      {categories.map((c, i) => (
        <div key={c} className="flex min-w-[55px] flex-col items-center gap-2">
          <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-[#e8e2ff] to-[#f3eee7] text-xl">
            {["W", "M", "K", "T", "H"][i]}
          </div>
          <span className="text-xs text-black/60">{c}</span>
        </div>
      ))}
    </div>
  );
}
