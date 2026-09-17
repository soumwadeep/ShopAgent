"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Box, ChevronDown, Clock, Gift, Lightbulb, Plus, Send, Sparkles, Tag } from "lucide-react"
import styles from "./shopagent-hero.module.css"

const prompts = [
  ["AI Picks", Sparkles, "Help me find the best options for "],
  ["Top Brands", Tag, "Compare the top brands for "],
  ["Products", Box, "Find a product that "],
  ["Price History", Clock, "Help me compare prices for "],
  ["For You", Gift, "Suggest something for "],
] as const

export function ShoppingComposer() {
  const [message, setMessage] = useState("")
  const [mode, setMode] = useState("Product List")
  const input = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const setPrompt = (value: string) => { setMessage(value); input.current?.focus() }
  const submit = () => { if (message.trim()) router.push(`/dashboard/agent?${new URLSearchParams({ q: message.trim(), mode })}`); else input.current?.focus() }
  return <div className={styles.composerArea}>
    <div className={styles.chips}>{prompts.map(([label, Icon, prompt]) => <button key={label} type="button" onClick={() => setPrompt(prompt)}><Icon size={21} />{label}</button>)}</div>
    <form id="shopping-composer" className={styles.composer} onSubmit={event => { event.preventDefault(); submit() }}>
      <label className={styles.composerInput}><Sparkles size={22} /><span className="sr-only">Tell ShopAgent what you need</span><textarea ref={input} rows={1} value={message} onChange={event => setMessage(event.target.value)} placeholder="Ask about anything you need…" maxLength={2000} onKeyDown={event => { if (event.nativeEvent.isComposing || event.keyCode === 229) return; if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); submit() } }} /></label>
      <div className={styles.composerToolbar}><div className={styles.composerTools}><button type="button" aria-label="Add another item to your shopping request" className={styles.addButton} onClick={() => setPrompt(message ? `${message}\nAlso find ` : "I need help finding ")}><Plus size={23} /></button><label className={styles.modeSelect}><span className="sr-only">Shopping mode</span><select value={mode} onChange={event => setMode(event.target.value)}><option>Product List</option><option>Compare options</option><option>Shopping plan</option></select><ChevronDown size={15} /></label><button type="button" className={styles.ideasButton} onClick={() => setPrompt("Plan my weekly groceries and compare nearby supermarkets with online options.")}><Lightbulb size={18} />Ideas</button></div><div className={styles.composerSubmit}><span className={styles.agentLabel}><span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>ShopAgent AI<ChevronDown size={15} /></span><button className={styles.primaryButton} type="submit">Send <Send size={17} /></button></div></div>
    </form>
  </div>
}
