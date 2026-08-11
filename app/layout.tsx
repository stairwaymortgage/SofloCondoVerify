import type { Metadata } from "next";
import localFont from "next/font/local";
import Analytics from "@/components/Analytics";
import { siteUrl } from "@/lib/schema";
import "./globals.css";

const publicSans = localFont({
  src: [
    { path: "./fonts/PublicSans-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/PublicSans-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/PublicSans-600.woff2", weight: "600", style: "normal" },
    { path: "./fonts/PublicSans-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/PublicSans-800.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-public-sans",
  display: "swap",
});

/**
 * `preload: false` is deliberate. next/font preloads every declared face at
 * high priority, and on Vercel that put all eight woff2 files (~110 kB) in
 * front of the LCP on every page. Roboto Mono only ever sets `.mono` — as-of
 * dates, record numbers, source lines — which is small print, never a
 * heading and never the largest element. Letting its three files load on CSS
 * demand instead takes ~38 kB off the critical path site-wide; `display:
 * swap` and the generated fallback metrics already keep the swap shift-free.
 */
const robotoMono = localFont({
  src: [
    { path: "./fonts/RobotoMono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RobotoMono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/RobotoMono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-roboto-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  // Every page sets a relative `alternates.canonical`; this is what they
  // resolve against, so the production origin has to come from the same
  // NEXT_PUBLIC_SITE_URL the sitemaps and JSON-LD use. Without it, Next
  // silently emits localhost canonicals in a Vercel build.
  metadataBase: new URL(siteUrl("/")),
  title: "SoFloCondoVerify — Check any South Florida condo",
  description:
    "An independent condo verification record for South Florida (Miami-Dade, Broward, Palm Beach). FHA & VA status, reserve and structural signals, from official public records.",
  // Search Console property verification. Declared in the root layout so it
  // is present in every page's <head>, which is what keeps the property
  // verified if the home page is ever restructured. Not a secret — the token
  // only proves control of a domain someone already has to own.
  verification: {
    google: "4gL9dTHqFS__K4iDV8AtLNz5PdFjMdl2B046wTbo6ww",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${publicSans.variable} ${robotoMono.variable}`}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
