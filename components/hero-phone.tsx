"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { ArrowRight, BatteryFull, Gift, Heart, House, MapPin, Package, Search, ShoppingBag, ShoppingCart, Signal, Sparkles, Tag, User, Wifi } from "lucide-react"
import styles from "./shopagent-hero.module.css"

const products = [
  { name: "Sony WH-1000XM5", merchant: "Croma · Koramangala", price: "₹24,399", label: "Best match", image: "/images/shopagent-headphones.png", href: "/dashboard/agent?productId=sony-wh-1000xm5&intent=buy" },
  { name: "Nike Air Max 270", merchant: "Nike Official", price: "₹8,495", label: "Great value", image: "/images/shopagent-sneaker.png", href: "/dashboard/agent?q=Find+Nike+Air+Max+270&intent=buy" },
]

function PhoneInterface() {
  return <div className={styles.phoneInterface}>
    <div className={styles.statusBar}><span>9:41</span><span><Signal size={17} /><Wifi size={17} /><BatteryFull size={22} /></span></div>
    <div className={styles.island} aria-hidden="true"><i /></div>
    <div className={styles.appContent}>
      <div className={styles.appHeader}><span><span className={styles.brandMark} aria-hidden="true"><i /><i /><i /><i /></span>ShopAgent</span><span className={styles.appAvatar}>S</span></div>
      <div className={styles.greeting}><span>Hello,</span><p>What would you like<br />to shop for today?</p></div>
      <a href="#shopping-composer" className={styles.phoneSearch}><Search size={19} /><span>Ask for anything...</span><i><ArrowRight size={19} /></i></a>
      <div className={styles.phoneCategories}>{[["Top Brands", Tag], ["AI Picks", Sparkles], ["Nearby Stores", MapPin], ["Best Deals", Gift]].map(([label, Icon]) => { const ItemIcon = Icon as typeof Tag; return <a href="#shopping-composer" key={label as string}><ItemIcon size={25} />{label as string}</a> })}</div>
      <div className={styles.recommendationTitle}><span>Recommended for you</span><Link href="#collections">See all <ArrowRight size={13} /></Link></div>
      <div className={styles.phoneProducts}>{products.map((product, index) => <motion.article key={product.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 + index * .12 }} className={styles.phoneProduct}><div className={styles.productImage}><img src={product.image} alt={product.name} width={160} height={145} /><Heart size={20} aria-hidden="true" /></div><h3>{product.name}</h3><p>{product.merchant}</p><strong>{product.price}</strong><span className={styles.matchBadge}>{product.label}</span><Link className={styles.buyButton} href={product.href} aria-label={`Buy now: ${product.name}`}><ShoppingCart size={18} />Buy Now</Link></motion.article>)}</div>
    </div>
    <nav className={styles.phoneNavigation} aria-label="ShopAgent app preview">{[["Home", House, "/dashboard"], ["Collections", ShoppingBag, "#collections"], ["Orders", Package, "/dashboard/orders"], ["Profile", User, "/dashboard/settings"]].map(([label, Icon, href], index) => { const ItemIcon = Icon as typeof House; return <Link key={label as string} href={href as string} className={index === 0 ? styles.active : ""}><ItemIcon size={24} />{label as string}</Link> })}</nav>
  </div>
}

function HandwrittenCallouts() {
  return <div className={styles.callouts} aria-hidden="true">
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .6 }} className={styles.askNote}><span>You ask.</span><span className={styles.askArrow} /></motion.div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .8 }} className={styles.findNote}><span>Your agent<br />finds the best.</span><span className={styles.findArrow} /></motion.div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className={styles.buyNote}><span className={styles.buyArrow} /><span>You buy<br />with confidence.</span></motion.div>
  </div>
}

export function HeroPhone() {
  const reducedMotion = useReducedMotion()
  return <div className={styles.heroVisual}>
    <motion.div className={styles.lavenderGlow} aria-hidden="true" animate={reducedMotion ? {} : { opacity: [.65, .9, .65] }} transition={{ duration: 9, repeat: Infinity }} />
    <div className={styles.lavenderArc} aria-hidden="true" />
    <div className={styles.groundShadow} aria-hidden="true" />
    <motion.div className={styles.phoneEntrance} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8 }}><motion.div animate={reducedMotion ? {} : { y: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}><div className={styles.phoneMockup}><div className={styles.metalEdge} aria-hidden="true"><i /><i /><i /></div><div className={styles.phoneScreen}><PhoneInterface /></div></div></motion.div></motion.div>
    <HandwrittenCallouts />
  </div>
}
