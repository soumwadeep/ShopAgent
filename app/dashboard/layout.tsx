"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => { if (ready && !user) router.replace("/login"); }, [ready, user, router]);
  if (!ready || !user) return <main className="grid min-h-screen place-items-center bg-background text-muted-foreground">Opening ShopAgent...</main>;
  return <>{pathname !== "/dashboard/agent" && pathname !== "/dashboard/settings" && pathname !== "/dashboard" && <div className="border-b border-amber-300 bg-amber-50 px-4 py-2 text-center text-xs text-amber-900">Sample screen: products, orders, prices and savings here are demonstration data.</div>}{children}</>;
}
