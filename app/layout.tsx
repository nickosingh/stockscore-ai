import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "StockScore AI | Understand any stock in 10 seconds",
  description:
    "StockScore AI gives you a simple stock score, buy/hold view, valuation signal, portfolio score, and plain-English AI explanation.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo-icon.png",
  },
  openGraph: {
    title: "StockScore AI | Understand any stock in 10 seconds",
    description:
      "Simple AI stock scoring, buy/hold signals, portfolio analysis, and top stock ideas.",
    url: siteUrl,
    siteName: "StockScore AI",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 800,
        height: 380,
        alt: "StockScore AI",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "StockScore AI | Understand any stock in 10 seconds",
    description:
      "Simple AI stock scoring, buy/hold signals, portfolio analysis, and top stock ideas.",
    images: ["/og-image.png"],
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