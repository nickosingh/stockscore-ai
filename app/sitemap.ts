import { LAUNCH_WATCHLIST } from "@/app/lib/watchlists";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticPages = [
    "",
    "/top-stocks",
    "/portfolio",
    "/roast",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const stockPages = LAUNCH_WATCHLIST.map((ticker) => ({
    url: `${baseUrl}/stock/${ticker}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...stockPages];
}