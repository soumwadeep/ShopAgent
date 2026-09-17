"use client";

import Link from "next/link";
import { motion, MotionConfig } from "framer-motion";
import { ArrowRight, LayoutDashboard, Menu, Monitor, Moon, Play, Search, Sun, X } from "lucide-react";
import { signOut } from "firebase/auth";
import { useState } from "react";
import { HeroPhone } from "@/components/hero-phone";
import { ShoppingComposer } from "@/components/shopping-composer";
import { useAuth } from "@/components/auth-provider";
import { useTheme } from "@/components/theme-provider";
import { auth } from "@/lib/firebase";
import styles from "./shopagent-hero.module.css";

export function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

const navigation = [
  ["Features", "#agent"],
  ["Collections", "#collections"],
  ["How it works", "#how-it-works"],
  ["Pricing", "#pricing"],
];
const benefits = [
  [
    "Online + nearby",
    "Find options across online marketplaces, supermarkets, local stores and malls.",
  ],
  [
    "One clear decision",
    "Compare price, availability, delivery and what matters to you.",
  ],
  ["You stay in control", "ShopAgent does the legwork and asks before buying."],
];
const entrance = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
};

function HeroHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const { user, ready } = useAuth();
  const { theme, setTheme } = useTheme();
  const fullName = user?.displayName?.trim() || user?.email?.split("@")[0] || "Account";
  const name = fullName.split(/\s+/)[0];
  const signOutUser = async () => {
    await signOut(auth);
    setMenuOpen(false);
  };
  return (
    <header className={styles.header}>
      <Link href="/" className={styles.logo}>
        <BrandMark />
        <span>
          ShopAgent <em>AI</em>
        </span>
      </Link>
      <nav className={styles.navigation} aria-label="Main navigation">
        {navigation.map(([label, href]) => (
          <Link key={label} href={href}>
            {label}
          </Link>
        ))}
      </nav>
      <div className={styles.headerActions}>
        <a
          href="#shopping-composer"
          className={styles.searchButton}
          aria-label="Ask ShopAgent"
        >
          <Search size={22} />
        </a>
        <div className={styles.themeWrap}>
          <button type="button" className={styles.themeButton} aria-label="Appearance" aria-expanded={themeOpen} title="Appearance" onClick={() => setThemeOpen(!themeOpen)}>
            {theme === "dark" ? <Moon size={20}/> : theme === "light" ? <Sun size={20}/> : <Monitor size={20}/>}
          </button>
          {themeOpen && <div className={styles.themeMenu} role="menu" aria-label="Appearance">
            {(["light", "dark", "system"] as const).map(value => <button key={value} type="button" role="menuitemradio" aria-checked={theme === value} onClick={() => { setTheme(value); setThemeOpen(false); }}><span>{value === "light" ? <Sun size={17}/> : value === "dark" ? <Moon size={17}/> : <Monitor size={17}/>}</span>{value[0].toUpperCase() + value.slice(1)}</button>)}
          </div>}
        </div>
        {ready && (user ? <>
          <span className={styles.accountName} title={fullName}>Hi, {name}</span>
          <Link href="/dashboard" className={`${styles.primaryButton} ${styles.dashboardButton}`}>Dashboard</Link>
          <Link href="/dashboard" className={styles.mobileDashboard} aria-label="Dashboard" title="Dashboard"><LayoutDashboard size={20}/></Link>
          <button type="button" onClick={signOutUser} className={`${styles.outlineButton} ${styles.signOutButton}`}>Sign out</button>
        </> : <>
          <Link href="/login" className={`${styles.outlineButton} ${styles.login}`}>Login</Link>
          <Link href="/signup" className={styles.primaryButton}>Start Free</Link>
        </>)}
        <button
          className={styles.menuButton}
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {menuOpen && (
        <nav className={styles.mobileNavigation} aria-label="Mobile navigation">
          {navigation.map(([label, href]) => (
            <Link onClick={() => setMenuOpen(false)} href={href} key={label}>
              {label}
            </Link>
          ))}
          {ready && (user ? <>
            <Link onClick={() => setMenuOpen(false)} href="/dashboard">Dashboard</Link>
            <button type="button" onClick={signOutUser}>Sign out</button>
          </> : <>
            <Link onClick={() => setMenuOpen(false)} href="/login">Login</Link>
            <Link onClick={() => setMenuOpen(false)} href="/signup">Start Free</Link>
          </>)}
          <div className={styles.mobileTheme} aria-label="Appearance">
            {(["light", "dark", "system"] as const).map(value => <button key={value} type="button" aria-pressed={theme === value} onClick={() => setTheme(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}
          </div>
        </nav>
      )}
    </header>
  );
}

function HeroContent() {
  return (
    <div className={styles.content}>
      <motion.p
        {...entrance}
        transition={{ duration: 0.5 }}
        className={styles.eyebrow}
      >
        Your personal shopping agent
      </motion.p>
      <motion.h1
        {...entrance}
        transition={{ duration: 0.65, delay: 0.06 }}
        className={styles.headline}
      >
        Simply
        <br />
        smarter.
        <br />
        Shopping,
        <br />
        <span>handled.</span>
      </motion.h1>
      <motion.p
        {...entrance}
        transition={{ duration: 0.65, delay: 0.13 }}
        className={styles.description}
      >
        ShopAgent turns what you need into a clear decision — finding the best
        options across online and nearby stores, comparing what matters, and
        helping you buy with confidence.
      </motion.p>
      <motion.div
        {...entrance}
        transition={{ duration: 0.65, delay: 0.2 }}
        className={styles.contentActions}
      >
        <a href="#shopping-composer" className={styles.primaryButton}>
          Ask ShopAgent <ArrowRight size={20} />
        </a>
        <Link href="#collections" className={styles.outlineButton}>
          Explore picks
        </Link>
      </motion.div>
      <motion.div
        {...entrance}
        transition={{ duration: 0.65, delay: 0.28 }}
        className={styles.socialProof}
      >
        <div className={styles.avatars} aria-hidden="true">
          {["#c9b8ff", "#a994f5", "#8064dc", "#5940a8"].map((color, index) => (
            <span key={index} style={{ backgroundColor: color }} />
          ))}
        </div>
        <p>People shop smarter with ShopAgent</p>
      </motion.div>
    </div>
  );
}

function HeroBenefits() {
  return (
    <aside className={styles.benefits} aria-label="Why ShopAgent">
      <ol>
        {benefits.map(([title, body], index) => (
          <motion.li
            key={title}
            {...entrance}
            transition={{ duration: 0.6, delay: 0.25 + index * 0.12 }}
          >
            <span className={styles.number}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <div>
              <h2>{title}</h2>
              <p>{body}</p>
            </div>
          </motion.li>
        ))}
      </ol>
      <a href="#how-it-works" className={styles.watchButton}>
        <span>
          <Play size={23} fill="currentColor" />
        </span>
        <span>
          Watch how you
          <br />
          can shop
        </span>
      </a>
    </aside>
  );
}

export function ShopAgentHero() {
  return (
    <MotionConfig reducedMotion="user">
      <div className={`${styles.root} font-sans`}>
        <HeroHeader />
        <section
          id="agent"
          aria-label="Your personal shopping agent"
          className={styles.hero}
        >
          <div className={styles.heroGrid}>
            <HeroContent />
            <HeroPhone />
            <HeroBenefits />
          </div>
          <ShoppingComposer />
        </section>
      </div>
    </MotionConfig>
  );
}
