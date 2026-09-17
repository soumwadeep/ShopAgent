"use client";

import { BrowserMultiFormatReader, type IScannerControls } from "@zxing/browser";
import { addDoc, collection, doc, limit, onSnapshot, orderBy, query as firestoreQuery, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ArrowRight, Camera, ExternalLink, History, Home, LoaderCircle, MapPin, ScanBarcode, Search, Settings2, ShoppingBag, Sparkles, Upload, X } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { auth, db } from "@/lib/firebase";
import type { Market, Offer, SourceStatus } from "@/lib/retailers";

type SearchResponse = { query: string; market: Market; pin: string; checkedAt: string; offers: Offer[]; sources: SourceStatus[]; error?: string };
type PhotoMatch = { query: string; product: string; extractedText: string; method: "vision" | "ocr_ai" | "ocr_only"; webResults: { title: string; url: string; snippet?: string }[]; error?: string };
type SavedSearch = { id: string; text: string; market: Market };
const marketNames: Record<Market, string> = { IN: "India", US: "United States", GB: "United Kingdom" };
const destinations = [
  { name: "Amazon", href: "https://www.amazon.in/" }, { name: "Flipkart", href: "https://www.flipkart.com/" },
  { name: "JioMart", href: "https://www.jiomart.com/" }, { name: "Croma", href: "https://www.croma.com/" },
  { name: "Reliance Digital", href: "https://www.reliancedigital.in/" }, { name: "BigBasket", href: "https://www.bigbasket.com/" },
  { name: "Blinkit", href: "https://blinkit.com/" }, { name: "Zepto", href: "https://www.zeptonow.com/" },
];

function BarcodeScanner({ onScan, onClose }: { onScan: (value: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let controls: IScannerControls | undefined;
    let active = true;
    const reader = new BrowserMultiFormatReader();
    if (video.current) reader.decodeFromVideoDevice(undefined, video.current, result => {
      if (result && active) { active = false; controls?.stop(); onScan(result.getText()); }
    }).then(next => { controls = next; if (!active) next.stop(); }).catch(() => setError("Camera unavailable. Enter the barcode below."));
    return () => { active = false; controls?.stop(); };
  }, [onScan]);
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Scan barcode"><div className="w-full max-w-md rounded-lg bg-card p-4 text-card-foreground"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Scan a barcode</h2><button onClick={onClose} aria-label="Close scanner" className="rounded-md p-2 hover:bg-muted"><X size={18}/></button></div><video ref={video} muted playsInline className="aspect-[4/3] w-full rounded-md bg-black object-cover"/><p className="mt-3 text-sm text-muted-foreground">Place a product barcode inside the camera view.</p>{error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}<form onSubmit={event => { event.preventDefault(); const value = new FormData(event.currentTarget).get("barcode")?.toString().trim(); if (value) onScan(value); }} className="mt-4 flex gap-2"><input name="barcode" inputMode="numeric" aria-label="Barcode number" placeholder="Or enter barcode number" className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm"/><button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Search</button></form></div></div>;
}

function PhotoSearchDialog({ onSearch, onClose, busy, error }: { onSearch: (photo: File) => void; onClose: () => void; busy: boolean; error: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  useEffect(() => {
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) { setCameraError("Camera unavailable. Upload a photo instead."); return; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false }).then(next => {
      if (!active) { next.getTracks().forEach(track => track.stop()); return; }
      stream.current = next;
      if (video.current) video.current.srcObject = next;
    }).catch(() => setCameraError("Camera unavailable. Upload a photo instead."));
    return () => { active = false; stream.current?.getTracks().forEach(track => track.stop()); };
  }, []);
  useEffect(() => {
    if (!photo) { setPreview(""); return; }
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const capture = () => {
    const source = video.current;
    if (!source?.videoWidth) { setCameraError("Camera is still starting. Try again or upload a photo."); return; }
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1600 / Math.max(source.videoWidth, source.videoHeight));
    canvas.width = Math.round(source.videoWidth * scale);
    canvas.height = Math.round(source.videoHeight * scale);
    canvas.getContext("2d")?.drawImage(source, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => { if (blob) setPhoto(new File([blob], "product.jpg", { type: "image/jpeg" })); }, "image/jpeg", 0.85);
  };
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" role="dialog" aria-modal="true" aria-label="Search by photo"><div className="w-full max-w-lg rounded-lg bg-card p-4 text-card-foreground shadow-xl"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Search by photo</h2><button onClick={onClose} disabled={busy} aria-label="Close photo search" className="rounded-md p-2 hover:bg-muted disabled:opacity-50"><X size={18}/></button></div><div className="relative aspect-[4/3] overflow-hidden rounded-md bg-black">{preview ? <img src={preview} alt="Selected product" className="size-full object-contain"/> : <video ref={video} autoPlay muted playsInline className="size-full object-contain"/>}</div><p className="mt-3 text-sm text-muted-foreground">Photograph the product or its packaging, with the brand and model text visible.</p>{cameraError && <p className="mt-2 text-xs text-muted-foreground">{cameraError}</p>}{error && <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}<div className="mt-4 flex flex-wrap gap-2"><button type="button" onClick={capture} disabled={busy || !!preview} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"><Camera size={17}/> Capture</button><label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted"><Upload size={17}/> Upload<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const next = event.target.files?.[0]; if (next) setPhoto(next); }} className="sr-only"/></label>{photo && <button type="button" onClick={() => setPhoto(null)} disabled={busy} className="rounded-md border px-3 py-2 text-sm hover:bg-muted disabled:opacity-50">Retake</button>}{photo && <button type="button" onClick={() => onSearch(photo)} disabled={busy} className="ml-auto flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50">{busy ? <LoaderCircle size={17} className="animate-spin"/> : <Search size={17}/>} Search photo</button>}</div></div></div>;
}

function AgentContent() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const params = useSearchParams();
  const [input, setInput] = useState(params.get("q") ?? "");
  const [market, setMarket] = useState<Market>("IN");
  const [pin, setPin] = useState("");
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [history, setHistory] = useState<SavedSearch[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [scanner, setScanner] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [photoMatch, setPhotoMatch] = useState<PhotoMatch | null>(null);
  const [sort, setSort] = useState<"price" | "source" | "delivery">("price");
  useEffect(() => {
    if (!user) return;
    return onSnapshot(firestoreQuery(collection(db, "users", user.uid, "searches"), orderBy("createdAt", "desc"), limit(8)), snapshot => setHistory(snapshot.docs.map(doc => ({ id: doc.id, text: doc.data().text, market: doc.data().market }))), () => setError("Search history could not load. Check Firestore rules."));
  }, [user]);
  useEffect(() => {
    if (!user) return;
    return onSnapshot(doc(db, "users", user.uid), snapshot => {
      const value = snapshot.data()?.market;
      if (value === "IN" || value === "US" || value === "GB") setMarket(value);
      const savedPin = snapshot.data()?.deliveryPin;
      if (typeof savedPin === "string" && /^\d{6}$/.test(savedPin)) setPin(savedPin);
    });
  }, [user]);
  const runSearch = async (value = input, nextMarket = market, match: PhotoMatch | null = null) => {
    const text = value.trim();
    if (text.length < 2) { setError("Enter at least two characters."); return; }
    if (nextMarket === "IN" && pin && !/^\d{6}$/.test(pin)) { setError("Enter a six-digit delivery PIN or leave it empty."); return; }
    if (!user) return;
    setInput(text); setMarket(nextMarket); setError(""); setBusy(true); setResult(null); setPhotoMatch(match);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`/api/search?q=${encodeURIComponent(text)}&market=${nextMarket}&pin=${encodeURIComponent(pin)}`, { headers: { Authorization: `Bearer ${token}` } });
      const data: SearchResponse = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Search failed.");
      setResult(data);
      await addDoc(collection(db, "users", user.uid, "searches"), { text, market: nextMarket, createdAt: serverTimestamp() });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Search failed."); }
    finally { setBusy(false); }
  };
  const searchPhoto = async (photo: File) => {
    if (!user) return;
    setPhotoError(""); setPhotoBusy(true);
    try {
      const form = new FormData();
      form.set("image", photo);
      const token = await user.getIdToken();
      const response = await fetch("/api/image-search", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
      const data: PhotoMatch = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Photo search failed.");
      setPhotoOpen(false);
      await runSearch(data.query, market, data);
    } catch (cause) { setPhotoError(cause instanceof Error ? cause.message : "Photo search failed."); }
    finally { setPhotoBusy(false); }
  };
  const sorted = [...(result?.offers ?? [])].sort((a, b) => sort === "source" ? a.source.localeCompare(b.source) : sort === "delivery" ? (a.deliveryMinutes ?? Infinity) - (b.deliveryMinutes ?? Infinity) : a.currency === b.currency ? (a.price ?? Infinity) - (b.price ?? Infinity) : 0);
  return <main className="min-h-screen bg-background text-foreground">
    <header className="border-b bg-card"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-3 sm:px-6"><Link href="/dashboard/agent" className="flex shrink-0 items-center gap-1.5 text-base font-semibold sm:gap-2 sm:text-lg"><Sparkles className="text-primary" size={21}/> ShopAgent</Link><nav className="flex items-center gap-0.5 sm:gap-3"><Link href="/" aria-label="Main home" title="Main home" className="flex items-center gap-1 rounded-md p-2 text-sm hover:bg-muted sm:px-3"><Home size={18}/><span className="hidden sm:inline">Home</span></Link><Link href="/dashboard/agent" className="hidden rounded-md bg-muted px-2 py-2 text-sm font-medium sm:inline-flex sm:px-3">Agent</Link><Link href="/dashboard/settings" aria-label="Settings" title="Settings" className="rounded-md p-2 hover:bg-muted"><Settings2 size={19}/></Link><button onClick={() => signOut(auth).then(() => router.replace("/login"))} className="rounded-md px-1.5 py-2 text-xs text-muted-foreground hover:bg-muted sm:px-2 sm:text-sm">Sign out</button></nav></div></header>
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-7 pb-24 sm:px-6 md:grid-cols-[minmax(0,1fr)_250px] md:py-12">
      <div className="min-w-0"><div className="mb-7"><p className="text-sm font-medium text-primary">Your shopping agent</p><h1 className="mt-1 text-3xl font-semibold sm:text-4xl">What are you looking for?</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">Search official product feeds where connected. Prices and availability come from retailers; delivery depends on your exact address.</p></div>
        <form onSubmit={event => { event.preventDefault(); runSearch(); }} className="rounded-lg border bg-card p-3 shadow-sm"><div className="flex items-center gap-1 sm:gap-2"><Search className="ml-1 shrink-0 text-muted-foreground" size={20}/><input value={input} onChange={event => setInput(event.target.value)} placeholder="Product name or barcode" aria-label="Product name or barcode" className="min-w-0 flex-1 bg-transparent px-1 py-3 text-base outline-none sm:px-2"/><button type="button" onClick={() => { setPhotoError(""); setPhotoOpen(true); }} title="Search by photo" aria-label="Search by photo" className="rounded-md p-2 text-muted-foreground hover:bg-muted"><Camera size={20}/></button><button type="button" onClick={() => setScanner(true)} title="Scan barcode" aria-label="Scan barcode" className="rounded-md p-2 text-muted-foreground hover:bg-muted"><ScanBarcode size={20}/></button><button disabled={busy} className="grid size-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-50" aria-label="Search products">{busy ? <LoaderCircle size={19} className="animate-spin"/> : <ArrowRight size={20}/>}</button></div><div className="flex flex-wrap items-center gap-3 border-t px-1 pt-3"><label className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={15}/><select value={market} onChange={event => setMarket(event.target.value as Market)} className="max-w-36 bg-transparent font-medium text-foreground outline-none" aria-label="Shopping market"><option value="IN">India</option><option value="US">United States</option><option value="GB">United Kingdom</option></select></label>{market === "IN" && <label className="flex items-center gap-2 text-xs text-muted-foreground">Delivery PIN<input value={pin} onChange={event => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" pattern="[0-9]{6}" maxLength={6} placeholder="6 digits" aria-label="Delivery PIN" className="w-24 rounded-md border bg-background px-2 py-1.5 text-foreground"/></label>}<span className="text-xs text-muted-foreground">Delivery confirmed at checkout</span></div></form>
        {error && <p role="alert" className="mt-3 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">{error}</p>}
        {photoMatch && <section className="mt-6 border-b pb-6"><p className="text-xs font-medium text-primary">{photoMatch.method === "vision" ? "Photo match" : "Packaging text match"}</p><h2 className="mt-1 text-lg font-semibold">{photoMatch.product}</h2>{photoMatch.extractedText && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">Text found: {photoMatch.extractedText}</p>}{photoMatch.webResults.length > 0 && <><h3 className="mt-5 text-sm font-semibold">Web results</h3><div className="mt-2 grid gap-2 sm:grid-cols-2">{photoMatch.webResults.map(link => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="min-w-0 rounded-md border bg-card p-3 hover:border-primary"><span className="flex items-start justify-between gap-2 text-sm font-medium"><span className="line-clamp-2 break-words">{link.title}</span><ExternalLink size={14} className="mt-0.5 shrink-0"/></span><span className="mt-1 block truncate text-xs text-muted-foreground">{new URL(link.url).hostname}</span>{link.snippet && <span className="mt-2 line-clamp-2 block text-xs text-muted-foreground">{link.snippet}</span>}</a>)}</div><p className="mt-2 text-xs text-muted-foreground">AI-suggested links. Confirm the product and seller on each site.</p></>}</section>}
        {!result && !busy && <div className="mt-8"><h2 className="text-sm font-semibold">Try a search</h2><div className="mt-3 flex flex-wrap gap-2">{["Sony headphones", "Running shoes", "5 kg basmati rice"].map(item => <button key={item} onClick={() => runSearch(item)} className="rounded-md border bg-card px-3 py-2 text-sm hover:border-primary">{item}</button>)}</div></div>}
        {result && <section className="mt-8"><div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs text-muted-foreground">{marketNames[result.market]}{result.pin ? ` · ${result.pin}` : ""} · Checked {new Date(result.checkedAt).toLocaleTimeString()}</p><h2 className="mt-1 text-xl font-semibold">Results for “{result.query}”</h2></div><label className="text-xs text-muted-foreground">Sort <select value={sort} onChange={event => setSort(event.target.value as "price" | "source" | "delivery")} className="ml-1 rounded-md border bg-card px-2 py-1.5 text-foreground"><option value="price">Item price</option><option value="delivery">Fastest known</option><option value="source">Retailer</option></select></label></div>
          <div className="mt-4 flex flex-wrap gap-2">{result.sources.map(source => <span key={source.source} className={`rounded-md border px-2 py-1 text-xs ${source.status === "live" || source.status === "feed" ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" : "text-muted-foreground"}`}>{source.source}: {source.detail}</span>)}</div>
          {sorted.length === 0 ? <div className="mt-5 rounded-lg border bg-card p-6"><p className="font-medium">No connected offers for this search.</p><p className="mt-2 text-sm text-muted-foreground">Connect official API credentials or authorized partner feeds. You can also open each store directly.</p></div> : <div className="mt-5 space-y-2">{sorted.map(offer => <article key={offer.id} className="flex gap-4 rounded-lg border bg-card p-3 sm:p-4"><div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-md bg-muted sm:size-24">{offer.image ? <img src={offer.image} alt="" className="size-full object-contain"/> : <ShoppingBag size={25} className="text-muted-foreground"/>}</div><div className="min-w-0 flex-1"><p className="text-xs font-medium text-primary">{offer.source}{offer.origin === "partner_feed" ? " · Partner feed" : " · Official API"}</p><h3 className="mt-1 line-clamp-2 text-sm font-semibold sm:text-base">{offer.title}</h3><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground"><span>{offer.availability ?? "Availability unconfirmed"}</span><span>{offer.delivery ?? "Delivery ETA at checkout"}</span>{offer.deliveryFee != null && <span>Delivery fee ₹{offer.deliveryFee}</span>}{offer.observedAt && <span>Updated {new Date(offer.observedAt).toLocaleString()}</span>}</div></div><div className="flex shrink-0 flex-col items-end justify-between gap-3"><p className="text-sm font-semibold sm:text-lg">{offer.price != null && offer.currency ? new Intl.NumberFormat(result.market === "IN" ? "en-IN" : "en", { style: "currency", currency: offer.currency, maximumFractionDigits: 0 }).format(offer.price) : "Check price"}</p><a href={offer.url} target="_blank" rel="noopener noreferrer sponsored" className="flex items-center gap-1 rounded-md bg-foreground px-2 py-2 text-xs font-medium text-background sm:px-3">View <ExternalLink size={13}/></a></div></article>)}</div>}
          <p className="mt-4 text-xs text-muted-foreground">Item prices and feed estimates may change. Fastest known ranks only offers with a supplied PIN-specific estimate; confirm stock, fees, and delivery at checkout.</p>
        </section>}
      </div>
      <aside className="space-y-7"><section><div className="flex items-center gap-2"><History size={17} className="text-primary"/><h2 className="text-sm font-semibold">Recent searches</h2></div><div className="mt-3 space-y-1">{history.length ? history.map(item => <button key={item.id} onClick={() => runSearch(item.text, item.market)} className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-muted"><span className="truncate">{item.text}</span><span className="shrink-0 text-xs text-muted-foreground">{item.market}</span></button>) : <p className="px-2 text-xs text-muted-foreground">Your searches will appear here.</p>}</div></section><section><h2 className="text-sm font-semibold">Appearance</h2><div className="mt-3 flex rounded-md border bg-card p-1">{(["light", "dark", "system"] as const).map(value => <button key={value} onClick={() => setTheme(value)} aria-pressed={theme === value} className={`flex-1 rounded px-2 py-1.5 text-xs capitalize ${theme === value ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{value}</button>)}</div></section>{market === "IN" && <section><h2 className="text-sm font-semibold">Store coverage</h2><p className="mt-1 text-xs text-muted-foreground">Official APIs or authorized feeds appear in comparison when connected. Open any store directly.</p><div className="mt-3 grid grid-cols-2 gap-2">{destinations.map(store => <a key={store.name} href={store.href} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center justify-between gap-1 rounded-md border bg-card px-2 py-2 text-xs hover:border-primary"><span className="min-w-0"><span className="block">{store.name}</span>{result && <span className="mt-0.5 block text-[10px] text-muted-foreground">{result.sources.find(source => source.source === store.name)?.status === "feed" ? "Partner feed" : result.sources.find(source => source.source === store.name)?.status === "live" ? "Official API" : "Direct only"}</span>}</span><ExternalLink size={12} className="shrink-0"/></a>)}</div></section>}</aside>
    </div>
    {scanner && <BarcodeScanner onClose={() => setScanner(false)} onScan={value => { setScanner(false); runSearch(value); }} />}
    {photoOpen && <PhotoSearchDialog onClose={() => setPhotoOpen(false)} onSearch={searchPhoto} busy={photoBusy} error={photoError}/>}
  </main>;
}

export default function AgentPage() { return <Suspense fallback={<main className="min-h-screen bg-background"/>}><AgentContent/></Suspense>; }
