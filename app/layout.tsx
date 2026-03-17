import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockScore AI | Understand any stock in 10 seconds",
  description:
    "StockScore AI gives you a simple stock score, buy/hold view, valuation signal, portfolio score, and plain-English AI explanation.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  openGraph: {
    title: "StockScore AI | Understand any stock in 10 seconds",
    description:
      "Simple AI stock scoring, buy/hold signals, portfolio analysis, and top stock ideas.",
    url: "/",
    siteName: "StockScore AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "StockScore AI | Understand any stock in 10 seconds",
    description:
      "Simple AI stock scoring, buy/hold signals, portfolio analysis, and top stock ideas.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}