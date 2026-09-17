"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleAuthProvider, createUserWithEmailAndPassword, isSignInWithEmailLink, sendSignInLinkToEmail, signInWithEmailAndPassword, signInWithEmailLink, signInWithPopup } from "firebase/auth";
import { useEffect, useState } from "react";
import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/auth-provider";

export function AuthScreen({ signup = false }: { signup?: boolean }) {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailMode, setEmailMode] = useState<"link" | "password">("link");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => { if (user) router.replace("/dashboard/agent"); }, [user, router]);
  useEffect(() => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;
    const stored = window.localStorage.getItem("shopagent-email-link") || window.prompt("Confirm the email address you used for sign-in");
    if (!stored) return;
    signInWithEmailLink(auth, stored, window.location.href)
      .then(() => { window.localStorage.removeItem("shopagent-email-link"); router.replace("/dashboard/agent"); })
      .catch((error) => setMessage(error.message));
  }, [router]);
  const google = async () => {
    setBusy(true); setMessage("");
    try { await signInWithPopup(auth, new GoogleAuthProvider()); router.replace("/dashboard/agent"); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Google sign-in failed."); }
    finally { setBusy(false); }
  };
  const submitEmail = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      if (emailMode === "password") {
        if (signup) await createUserWithEmailAndPassword(auth, email, password);
        else await signInWithEmailAndPassword(auth, email, password);
        router.replace("/dashboard/agent");
      } else {
        await sendSignInLinkToEmail(auth, email, { url: `${window.location.origin}/login`, handleCodeInApp: true });
        window.localStorage.setItem("shopagent-email-link", email);
        setMessage("Check your inbox for the sign-in link.");
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not send the link."); }
    finally { setBusy(false); }
  };
  return <main className="grid min-h-screen place-items-center bg-background px-5 py-12 text-foreground">
    <div className="w-full max-w-md">
      <Link href="/" className="mb-10 flex items-center justify-center gap-2 text-xl font-semibold"><Sparkles className="text-primary" size={23}/> ShopAgent</Link>
      <div className="rounded-lg border bg-card p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-semibold">{signup ? "Create your account" : "Welcome back"}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to save searches and compare offers.</p>
        <button disabled={busy} onClick={google} className="mt-7 flex w-full items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium hover:bg-muted disabled:opacity-50">Continue with Google <ArrowRight size={16}/></button>
        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground"><span className="h-px flex-1 bg-border"/>or use email<span className="h-px flex-1 bg-border"/></div>
        <div className="mb-4 flex rounded-md border bg-background p-1">{(["link", "password"] as const).map(mode => <button key={mode} type="button" onClick={() => { setEmailMode(mode); setMessage(""); }} aria-pressed={emailMode === mode} className={`flex-1 rounded px-2 py-2 text-xs font-medium ${emailMode === mode ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>{mode === "link" ? "Email link" : "Password"}</button>)}</div>
        <form onSubmit={submitEmail} className="space-y-3"><label htmlFor="email" className="block text-sm font-medium">Email address</label><input id="email" type="email" required autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"/>{emailMode === "password" && <><label htmlFor="password" className="block text-sm font-medium">Password</label><input id="password" type="password" required minLength={6} autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={event => setPassword(event.target.value)} className="w-full rounded-md border bg-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"/></>}<button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-50"><Mail size={16}/>{emailMode === "link" ? "Email me a sign-in link" : signup ? "Create account" : "Sign in"}</button></form>
        {message && <p role="status" className="mt-4 break-words text-sm text-muted-foreground">{message}</p>}
      </div>
      <p className="mt-5 text-center text-sm text-muted-foreground">{signup ? "Already registered?" : "New to ShopAgent?"} <Link className="font-semibold text-primary" href={signup ? "/login" : "/signup"}>{signup ? "Sign in" : "Create an account"}</Link></p>
    </div>
  </main>;
}
