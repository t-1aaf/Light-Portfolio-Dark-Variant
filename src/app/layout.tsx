import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { site } from "@/data/content";

const sans = Instrument_Sans({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: `${site.name}: ${site.role}`,
  description: site.description,
  openGraph: {
    title: `${site.name}: ${site.role}`,
    description: site.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#030507",
  width: "device-width",
  initialScale: 1,
};

/**
 * Shared shell: fonts, grain, base styles. The `data-js` attribute is set before first paint so CSS
 * can hide things that JS will animate in (no flash), while visitors without JS still see everything.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.setAttribute('data-js','')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
