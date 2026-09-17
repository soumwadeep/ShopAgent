"use client";

import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Home, MapPin, Settings2, Sparkles } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { auth, db } from "@/lib/firebase";
import type { Market } from "@/lib/retailers";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [market, setMarket] = useState<Market>("IN");
  const [deliveryPin, setDeliveryPin] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), snapshot => {
      const value = snapshot.data()?.market;
      if (value === "IN" || value === "US" || value === "GB") setMarket(value);
      const pin = snapshot.data()?.deliveryPin;
      if (typeof pin === "string") setDeliveryPin(pin);
    });
  }, [user]);
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); if (!user) return;
    setSaving(true); setMessage("");
    if (market === "IN" && deliveryPin && !/^\d{6}$/.test(deliveryPin)) { setMessage("Enter a six-digit delivery PIN or leave it empty."); setSaving(false); return; }
    try { await setDoc(doc(db, "users", user.uid), { market, deliveryPin }, { merge: true }); setMessage("Shopping preferences saved."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Could not save settings."); }
    finally { setSaving(false); }
  };
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-4xl items-center justify-between gap-3 px-4 sm:px-6"><Link href="/dashboard/agent" className="flex items-center gap-2 text-lg font-semibold"><Sparkles size={21} className="text-primary"/> ShopAgent</Link><nav className="flex items-center gap-3"><Link href="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><Home size={17}/> Home</Link><Link href="/dashboard/agent" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/> Agent</Link></nav></div></header>
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"><div className="mb-8 flex items-center gap-3"><Settings2 className="text-primary"/><h1 className="text-3xl font-semibold">Settings</h1></div><div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-lg border bg-card p-5"><h2 className="font-semibold">Account</h2><p className="mt-3 break-all text-sm text-muted-foreground">{user?.displayName || user?.email || "Signed in"}</p><button onClick={() => signOut(auth).then(() => router.replace("/login"))} className="mt-6 rounded-md border px-3 py-2 text-sm hover:bg-muted">Sign out</button></section>
      <section className="rounded-lg border bg-card p-5"><h2 className="font-semibold">Appearance</h2><p className="mt-1 text-sm text-muted-foreground">Choose how ShopAgent looks on this device.</p><div className="mt-5 flex rounded-md border p-1">{(["light", "dark", "system"] as const).map(value => <button key={value} onClick={() => setTheme(value)} aria-pressed={theme === value} className={`flex-1 rounded px-2 py-2 text-sm capitalize ${theme === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{value}</button>)}</div></section>
      <section className="rounded-lg border bg-card p-5 md:col-span-2"><h2 className="flex items-center gap-2 font-semibold"><MapPin size={18} className="text-primary"/> Shopping location</h2><p className="mt-1 text-sm text-muted-foreground">Your PIN filters partner-feed offers. Confirm delivery to your full address at checkout.</p><form onSubmit={save} className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end"><label className="flex-1 text-sm font-medium">Market<select value={market} onChange={event => setMarket(event.target.value as Market)} className="mt-2 block w-full rounded-md border bg-background px-3 py-2.5"><option value="IN">India</option><option value="US">United States</option><option value="GB">United Kingdom</option></select></label>{market === "IN" && <label className="flex-1 text-sm font-medium">Delivery PIN<input value={deliveryPin} onChange={event => setDeliveryPin(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" maxLength={6} placeholder="6-digit PIN" className="mt-2 block w-full rounded-md border bg-background px-3 py-2.5"/></label>}<button disabled={saving} className="rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50">Save</button></form>{message && <p role="status" className="mt-3 text-sm text-muted-foreground">{message}</p>}</section>
    </div></div>
  </main>;
}
