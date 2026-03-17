import Link from "next/link";
import { LAUNCH_WATCHLIST } from "@/app/lib/watchlists";

type StockApiResponse = {
  ok: boolean;
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
};

type RankedStock = StockApiResponse & {
  score: number;
  trend: string;
  risk: string;
};

const WATCHLIST = LAUNCH_WATCHLIST;

function calculateScore(changePercent: number | null) {
  if (changePercent === null) return 60;
  if (changePercent >= 4) return 92;
  if (changePercent >= 2) return 85;
  if (changePercent >= 1) return 78;
  if (changePercent >= 0) return 72;
  if (changePercent >= -2) return 60;
  if (changePercent >= -4) return 48;
  return 35;
}

function getTrend(changePercent: number | null) {
  if (changePercent === null) return "Sideways";
  if (changePercent >= 1) return "Uptrend";
  if (changePercent <= -1) return "Downtrend";
  return "Sideways";
}

function getRisk(changePercent: number | null) {
  if (changePercent === null) return "Medium";
  const abs = Math.abs(changePercent);
  if (abs >= 3) return "High";
  if (abs >= 1) return "Medium";
  return "Low";
}

function formatCurrency(value: number | null) {
  if (value === null) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function formatLargeNumber(value: number | null) {
  if (value === null) return "N/A";

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;

  return `$${value.toLocaleString()}`;
}

async function getStock(ticker: string): Promise<StockApiResponse | null> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/stock/${ticker}`, {
      cache: "no-store",
    });

    const data = await res.json();

    if (!res.ok || !data.ok) return null;

    return data;
  } catch {
    return null;
  }
}

async function getRankedStocks(): Promise<RankedStock[]> {
  const results = await Promise.all(WATCHLIST.map((ticker) => getStock(ticker)));

  return results
    .filter((stock): stock is StockApiResponse => stock !== null)
    .map((stock) => ({
      ...stock,
      score: calculateScore(stock.changePercent),
      trend: getTrend(stock.changePercent),
      risk: getRisk(stock.changePercent),
    }))
    .sort((a, b) => b.score - a.score);
}

function buildMarketBriefing(rankedStocks: RankedStock[]) {
  if (rankedStocks.length === 0) {
    return {
      tone: "Unavailable",
      summary:
        "StockScore AI could not load enough live market data to generate today’s briefing.",
    };
  }

  const leader = rankedStocks[0];
  const laggard = rankedStocks[rankedStocks.length - 1];
  const positiveCount = rankedStocks.filter((stock) => (stock.changePercent ?? 0) >= 0).length;
  const avgScore =
    rankedStocks.reduce((sum, stock) => sum + stock.score, 0) / rankedStocks.length;

  let tone = "Mixed";

  if (avgScore >= 80 && positiveCount >= Math.ceil(rankedStocks.length * 0.6)) {
    tone = "Risk-On";
  } else if (avgScore < 60 && positiveCount < Math.ceil(rankedStocks.length * 0.4)) {
    tone = "Risk-Off";
  }

  const summary = `${tone} market tone today. ${leader.ticker} is leading the watchlist with a StockScore AI score of ${leader.score}/100, while ${laggard.ticker} is the weakest name right now. ${positiveCount} of ${rankedStocks.length} tracked stocks are trading positive today, which suggests ${tone === "Risk-On" ? "buyers currently have the edge" : tone === "Risk-Off" ? "investors are leaning cautious" : "the market is sending mixed signals"}.`;

  return { tone, summary };
}

export default async function TopStocksPage() {
  const rankedStocks = await getRankedStocks();
  const leaders = rankedStocks.slice(0, 3);
  const positiveCount = rankedStocks.filter((stock) => (stock.changePercent ?? 0) >= 0).length;
  const briefing = buildMarketBriefing(rankedStocks);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-lg font-bold text-emerald-300">
              S
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">StockScore AI</div>
              <div className="text-xs text-slate-400">
                Understand any stock in 10 seconds
              </div>
            </div>
          </Link>

          <div className="flex gap-3">
            <Link
              href="/portfolio"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              Portfolio Score
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 hover:bg-white/5"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="rounded-[32px] border border-white/10 bg-slate-900 p-8">
          <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
            Live daily leaderboard
          </div>

          <h1 className="mt-4 text-4xl font-bold">
            Top StockScore AI Scores Today
          </h1>

          <p className="mt-4 max-w-3xl text-slate-300">
            This leaderboard ranks a watchlist using live stock data from your StockScore AI API.
          </p>

          <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-6">
            <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">
              AI Market Briefing
            </div>
            <div className="mt-3 text-2xl font-bold">{briefing.tone}</div>
            <p className="mt-3 max-w-4xl leading-8 text-slate-200">{briefing.summary}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-500">Market Tone</div>
              <div className="mt-2 text-xl font-semibold text-cyan-300">
                {briefing.tone}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-500">Top Leader</div>
              <div className="mt-2 text-xl font-semibold text-emerald-300">
                {leaders.length > 0 ? leaders[0].ticker : "N/A"}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="text-xs text-slate-500">Positive Today</div>
              <div className="mt-2 text-xl font-semibold">
                {positiveCount} / {rankedStocks.length}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-3">
          {leaders.map((stock, index) => (
            <Link
              key={stock.ticker}
              href={`/stock/${stock.ticker}`}
              className="rounded-3xl border border-white/10 bg-white/5 p-6 hover:bg-white/10"
            >
              <div className="text-sm text-slate-500">
                #{index + 1} Leader
              </div>

              <div className="mt-2 text-2xl font-bold">
                {stock.name}
              </div>

              <div className="text-slate-400">{stock.ticker}</div>

              <div className="mt-6 text-5xl font-bold">{stock.score}</div>

              <div className="text-slate-500">Score</div>
            </Link>
          ))}
        </section>

        <section className="mt-10">
          <table className="w-full text-left">
            <thead className="border-b border-white/10 text-sm text-slate-500">
              <tr>
                <th className="py-3">Rank</th>
                <th>Ticker</th>
                <th>Company</th>
                <th>Score</th>
                <th>Price</th>
                <th>Change</th>
                <th>Trend</th>
                <th>Risk</th>
                <th>Market Cap</th>
              </tr>
            </thead>

            <tbody>
              {rankedStocks.map((stock, index) => (
                <tr key={stock.ticker} className="border-b border-white/5">
                  <td className="py-4">{index + 1}</td>

                  <td className="text-emerald-300">
                    <Link href={`/stock/${stock.ticker}`}>{stock.ticker}</Link>
                  </td>

                  <td>{stock.name}</td>

                  <td>{stock.score}</td>

                  <td>{formatCurrency(stock.price)}</td>

                  <td
                    className={
                      (stock.changePercent ?? 0) >= 0
                        ? "text-emerald-300"
                        : "text-rose-300"
                    }
                  >
                    {stock.changePercent !== null && stock.changePercent !== undefined
                      ? `${stock.changePercent >= 0 ? "+" : ""}${stock.changePercent.toFixed(2)}%`
                      : "N/A"}
                  </td>

                  <td>{stock.trend}</td>

                  <td>{stock.risk}</td>

                  <td>{formatLargeNumber(stock.marketCap)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}