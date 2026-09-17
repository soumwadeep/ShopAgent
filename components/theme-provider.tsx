"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";
const ThemeContext = createContext<{ theme: Theme; setTheme: (theme: Theme) => void }>({ theme: "system", setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("system");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const saved = localStorage.getItem("shopagent-theme"); if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved); setLoaded(true); }, []);
  useEffect(() => {
    if (!loaded) return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => document.documentElement.classList.toggle("dark", theme === "dark" || (theme === "system" && media.matches));
    apply(); media.addEventListener("change", apply);
    localStorage.setItem("shopagent-theme", theme);
    return () => media.removeEventListener("change", apply);
  }, [theme, loaded]);
  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
