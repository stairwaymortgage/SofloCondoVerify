import type { Metadata } from "next";
import localFont from "next/font/local";
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

const robotoMono = localFont({
  src: [
    { path: "./fonts/RobotoMono-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/RobotoMono-500.woff2", weight: "500", style: "normal" },
    { path: "./fonts/RobotoMono-600.woff2", weight: "600", style: "normal" },
  ],
  variable: "--font-roboto-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SoFloCondoVerify — Check any South Florida condo",
  description:
    "An independent condo verification record for South Florida (Miami-Dade, Broward, Palm Beach). FHA & VA status, reserve and structural signals, from official public records.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${publicSans.variable} ${robotoMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
