import { Analytics } from "@vercel/analytics/next";
import { Geist, Caveat } from "next/font/google";
import type { Metadata, Viewport } from "next";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const handwriting = Caveat({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-handwriting",
});

export const metadata: Metadata = {
  title: "ShopAgent AI — Simply smarter. Shopping, handled.",
  description:
    "Your personal AI shopping agent. Find and compare options across online marketplaces, supermarkets and nearby stores. You stay in control.",
};

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f8f8f9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-background">
      <body
        className={`${geist.variable} ${handwriting.variable} font-sans antialiased`}
      >
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
