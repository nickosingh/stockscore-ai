import Link from "next/link";
import ShareButtons from "./ShareButtons";
import { POPULAR_STOCKS } from "@/app/lib/watchlists";

type StockApiResponse = {
  ok: boolean;
  ticker: string;
  name: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  marketCap: number | null;
  error?: string;
  details?: string;
};

type ScoreBreakdown = {
  momentum: number;
  risk: number;
  sentiment: number;
  valuation: number;
  total: number;
};

async function getStock(ticker: string): Promise<StockApiResponse> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/stock/${ticker}`, {
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok || !data.ok) {
    throw new Error(data.details || data.error || "Failed to fetch stock");
  }

  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  return {
    title: `${symbol} Stock Analysis, Score & AI Forecast | StockScore AI`,
    description: `StockScore AI AI analysis for ${symbol}. See stock score, risk, valuation, trend, and AI explanation in plain English.`,
    openGraph: {
      title: `${symbol} Stock Analysis | StockScore AI`,
      description: `See StockScore AI score, valuation, trend, and AI explanation for ${symbol}.`,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/stock/${symbol}`,
      siteName: "StockScore AI",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${symbol} Stock Analysis | StockScore AI`,
      description: `See StockScore AI score, valuation, trend, and AI explanation for ${symbol}.`,
    },
  };
}

function formatCurrency(value: number | null) {
  if (value === null || value === undefined) return "N/A";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null || value === undefined) return "N/A";
  return `${value.toFixed(2)}%`;
}

function formatLargeNumber(value: number | null) {
  if (value === null || value === undefined) return "N/A";

  const abs = Math.abs(value);

  if (abs >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;

  return `$${value.toLocaleString()}`;
}

function getTrend(changePercent: number | null) {
  if (changePercent === null || changePercent === undefined) return "Sideways";
  if (changePercent >= 1) return "Uptrend";
  if (changePercent <= -1) return "Downtrend";
  return "Sideways";
}

function getRisk(changePercent: number | null) {
  if (changePercent === null || changePercent === undefined) return "Medium";
  const abs = Math.abs(changePercent);
  if (abs >= 3) return "High";
  if (abs >= 1) return "Medium";
  return "Low";
}

function getSentiment(changePercent: number | null) {
  if (changePercent === null || changePercent === undefined) return "Neutral";
  if (changePercent > 0.75) return "Bullish";
  if (changePercent < -0.75) return "Bearish";
  return "Neutral";
}

function getValuation(price: number | null, marketCap: number | null) {
  if (price === null || price === undefined || marketCap === null || marketCap === undefined) {
    return "Unknown";
  }

  if (marketCap >= 2_000_000_000_000 && price >= 500) return "Overvalued";
  if (marketCap >= 1_000_000_000_000 && price >= 250) return "Slightly Overvalued";
  if (marketCap >= 300_000_000_000 && price <= 80) return "Potentially Undervalued";
  if (price <= 40) return "Potentially Undervalued";

  return "Fairly Valued";
}

function getValuationColor(valuation: string) {
  if (valuation === "Potentially Undervalued") return "text-emerald-300";
  if (valuation === "Fairly Valued") return "text-cyan-300";
  if (valuation === "Slightly Overvalued") return "text-amber-300";
  if (valuation === "Overvalued") return "text-rose-300";
  return "text-slate-300";
}

function calculateBreakdown(
  changePercent: number | null,
  risk: string,
  sentiment: string,
  valuation: string
): ScoreBreakdown {
  let momentum = 15;
  if (changePercent !== null && changePercent !== undefined) {
    if (changePercent >= 4) momentum = 30;
    else if (changePercent >= 2) momentum = 27;
    else if (changePercent >= 1) momentum = 24;
    else if (changePercent >= 0) momentum = 20;
    else if (changePercent >= -2) momentum = 15;
    else if (changePercent >= -4) momentum = 9;
    else momentum = 4;
  }

  let riskScore = 20;
  if (risk === "Low") riskScore = 24;
  else if (risk === "Medium") riskScore = 18;
  else riskScore = 10;

  let sentimentScore = 20;
  if (sentiment === "Bullish") sentimentScore = 24;
  else if (sentiment === "Neutral") sentimentScore = 18;
  else sentimentScore = 10;

  let valuationScore = 20;
  if (valuation === "Potentially Undervalued") valuationScore = 24;
  else if (valuation === "Fairly Valued") valuationScore = 20;
  else if (valuation === "Slightly Overvalued") valuationScore = 15;
  else if (valuation === "Overvalued") valuationScore = 10;
  else valuationScore = 16;

  const total = Math.max(
    1,
    Math.min(99, momentum + riskScore + sentimentScore + valuationScore)
  );

  return {
    momentum,
    risk: riskScore,
    sentiment: sentimentScore,
    valuation: valuationScore,
    total,
  };
}

function getScoreLabel(score: number) {
  if (score >= 85) return "Strong";
  if (score >= 70) return "Healthy";
  if (score >= 55) return "Mixed";
  return "High Risk";
}

function getRecommendation(score: number, valuation: string, risk: string) {
  if (score >= 85 && valuation !== "Overvalued" && risk !== "High") return "BUY";
  if (score >= 75 && valuation === "Overvalued") return "BUY ON DIP";
  if (score >= 70) return "HOLD";
  if (score >= 55) return "WAIT";
  return "AVOID";
}

function getRecommendationColor(recommendation: string) {
  if (recommendation === "BUY") return "text-emerald-300";
  if (recommendation === "BUY ON DIP") return "text-cyan-300";
  if (recommendation === "HOLD") return "text-amber-300";
  if (recommendation === "WAIT") return "text-orange-300";
  return "text-rose-300";
}

function getDecisionReasons(
  trend: string,
  risk: string,
  sentiment: string,
  valuation: string
) {
  const reasons: string[] = [];

  if (trend === "Uptrend") reasons.push("Momentum is currently positive.");
  else if (trend === "Downtrend") reasons.push("Momentum is currently weak.");
  else reasons.push("Price action is currently neutral.");

  if (sentiment === "Bullish") reasons.push("Market tone looks constructive.");
  else if (sentiment === "Bearish") reasons.push("Investor tone looks cautious.");
  else reasons.push("Sentiment is balanced right now.");

  if (valuation === "Potentially Undervalued") reasons.push("Valuation looks attractive in this MVP model.");
  else if (valuation === "Fairly Valued") reasons.push("Valuation looks reasonable.");
  else if (valuation === "Slightly Overvalued") reasons.push("Valuation looks a bit stretched.");
  else if (valuation === "Overvalued") reasons.push("Valuation looks expensive.");

  if (risk === "High") reasons.push("Volatility risk is elevated.");
  else if (risk === "Low") reasons.push("Risk looks relatively controlled.");
  else reasons.push("Risk is moderate.");

  return reasons;
}

function getAiExplanation(
  name: string,
  changePercent: number | null,
  risk: string,
  trend: string,
  sentiment: string,
  valuation: string
) {
  if (changePercent === null || changePercent === undefined) {
    return `${name} has limited live data available in this MVP view, so StockScore AI is showing a neutral read until more indicators are added.`;
  }

  if (changePercent >= 2) {
    return `${name} is showing strong recent momentum with a ${sentiment.toLowerCase()} tone and a ${risk.toLowerCase()} risk profile. The current move suggests buyers are in control, although the stock currently screens as ${valuation.toLowerCase()} in this MVP valuation check.`;
  }

  if (changePercent >= 0) {
    return `${name} is trading with a mildly positive tone. The stock currently looks ${trend.toLowerCase()}, sentiment is ${sentiment.toLowerCase()}, and StockScore AI sees it as ${valuation.toLowerCase()} based on this early valuation model.`;
  }

  if (changePercent > -2) {
    return `${name} is showing some weakness but not a major breakdown. StockScore AI currently reads this as a more cautious setup, with ${risk.toLowerCase()} risk, ${sentiment.toLowerCase()} sentiment, and a ${valuation.toLowerCase()} valuation signal.`;
  }

  return `${name} is under noticeable pressure right now, with ${sentiment.toLowerCase()} sentiment and a ${risk.toLowerCase()} risk reading. Until momentum improves, StockScore AI treats this as a weaker near-term setup, while the valuation check currently reads ${valuation.toLowerCase()}.`;
}

export default async function StockPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase();

  let stock: StockApiResponse;

  try {
    stock = await getStock(symbol);
  } catch (error) {
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
                <div className="text-xs text-slate-400">Understand any stock in 10 seconds</div>
              </div>
            </Link>

            <Link
              href="/"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Back to home
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-[32px] border border-rose-400/20 bg-rose-400/10 p-8">
            <div className="text-sm uppercase tracking-[0.2em] text-rose-300">Error</div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight">Could not load stock data</h1>
            <p className="mt-4 text-slate-200">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950"
              >
                Go back home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const trend = getTrend(stock.changePercent);
  const risk = getRisk(stock.changePercent);
  const sentiment = getSentiment(stock.changePercent);
  const valuation = getValuation(stock.price, stock.marketCap);
  const breakdown = calculateBreakdown(stock.changePercent, risk, sentiment, valuation);
  const score = breakdown.total;
  const scoreLabel = getScoreLabel(score);
  const recommendation = getRecommendation(score, valuation, risk);
  const decisionReasons = getDecisionReasons(trend, risk, sentiment, valuation);
  const summary = getAiExplanation(
    stock.name,
    stock.changePercent,
    risk,
    trend,
    sentiment,
    valuation
  );

  const isPositive = (stock.change ?? 0) >= 0;

  const breakdownItems = [
    { label: "Momentum", value: breakdown.momentum, detail: "Recent price movement" },
    { label: "Risk", value: breakdown.risk, detail: "Lower volatility scores higher" },
    { label: "Sentiment", value: breakdown.sentiment, detail: "Bullish tone scores higher" },
    { label: "Valuation", value: breakdown.valuation, detail: "Fairer pricing scores better" },
  ];

  const relatedTickers = POPULAR_STOCKS;
  
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
              <div className="text-xs text-slate-400">Understand any stock in 10 seconds</div>
            </div>
          </Link>

          <Link
            href="/"
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/30 md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Stock overview</div>
                <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
                  {stock.name} ({stock.ticker}) Stock Analysis
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-lg">
                  <span className="font-semibold text-white">{formatCurrency(stock.price)}</span>
                  <span className={isPositive ? "text-emerald-300" : "text-rose-300"}>
                    {stock.change !== null ? `${isPositive ? "+" : ""}${stock.change.toFixed(2)}` : "N/A"} (
                    {stock.changePercent !== null
                      ? `${isPositive ? "+" : ""}${stock.changePercent.toFixed(2)}%`
                      : "N/A"}
                    )
                  </span>
                </div>
              </div>

              <div
                className={`rounded-2xl border px-3 py-2 text-sm ${
                  score >= 85
                    ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                    : score >= 70
                    ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                    : score >= 55
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                }`}
              >
                {scoreLabel}
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-[1.05fr,0.95fr]">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-400">StockScore AI Score</div>
                <div className="mt-4 flex items-end gap-3">
                  <div className="text-7xl font-bold leading-none text-white">{score}</div>
                  <div className="pb-2 text-2xl text-slate-500">/100</div>
                </div>
                <div className="mt-5 h-3 rounded-full bg-white/10">
                  <div className="h-3 rounded-full bg-emerald-400" style={{ width: `${score}%` }} />
                </div>
                <div className="mt-4 text-sm leading-7 text-slate-400">
                  This score is built from momentum, risk, sentiment, and valuation so users can see
                  more clearly why a stock looks strong or weak.
                </div>

                <ShareButtons ticker={stock.ticker} score={score} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-2">
                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Trend</div>
                  <div className="mt-2 text-xl font-semibold text-emerald-300">{trend}</div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Risk</div>
                  <div
                    className={`mt-2 text-xl font-semibold ${
                      risk === "Low"
                        ? "text-cyan-300"
                        : risk === "Medium"
                        ? "text-amber-300"
                        : "text-rose-300"
                    }`}
                  >
                    {risk}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Sentiment</div>
                  <div
                    className={`mt-2 text-xl font-semibold ${
                      sentiment === "Bullish"
                        ? "text-cyan-300"
                        : sentiment === "Neutral"
                        ? "text-amber-300"
                        : "text-rose-300"
                    }`}
                  >
                    {sentiment}
                  </div>
                </div>

                <div className="rounded-[28px] border border-white/10 bg-white/5 p-5">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Valuation</div>
                  <div className={`mt-2 text-xl font-semibold ${getValuationColor(valuation)}`}>
                    {valuation}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-xs uppercase tracking-wide text-slate-500">AI Explanation</div>
              <p className="mt-3 text-base leading-8 text-slate-300">{summary}</p>
            </div>
          </section>

          <section className="grid gap-6">
            <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/10 p-6">
              <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                Should I Buy This Stock?
              </div>
              <div className={`mt-3 text-3xl font-bold ${getRecommendationColor(recommendation)}`}>
                {recommendation}
              </div>
              <p className="mt-3 leading-8 text-slate-200">
                StockScore AI currently reads this name as a <span className="font-semibold">{recommendation}</span>{" "}
                based on score, valuation, sentiment, and risk.
              </p>

              <div className="mt-5 space-y-3">
                {decisionReasons.map((reason) => (
                  <div
                    key={reason}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 text-slate-100"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-slate-400">Why this score?</div>
              <div className="mt-5 space-y-4">
                {breakdownItems.map((item) => (
                  <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-semibold text-white">{item.label}</div>
                        <div className="mt-1 text-xs text-slate-500">{item.detail}</div>
                      </div>
                      <div className="text-lg font-bold text-emerald-300">{item.value}</div>
                    </div>
                    <div className="mt-3 h-2 rounded-full bg-white/10">
                      <div
                        className="h-2 rounded-full bg-emerald-400"
                        style={{ width: `${Math.min(100, (item.value / 30) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-sm text-slate-400">Key metrics</div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Price</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {formatCurrency(stock.price)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Market Cap</div>
                  <div className="mt-2 text-xl font-semibold text-white">
                    {formatLargeNumber(stock.marketCap)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Daily Change</div>
                  <div className={`mt-2 text-xl font-semibold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
                    {stock.change !== null ? `${isPositive ? "+" : ""}${stock.change.toFixed(2)}` : "N/A"}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Change %</div>
                  <div className={`mt-2 text-xl font-semibold ${isPositive ? "text-emerald-300" : "text-rose-300"}`}>
                    {formatPercent(stock.changePercent)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4 sm:col-span-2">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Valuation Check</div>
                  <div className={`mt-2 text-xl font-semibold ${getValuationColor(valuation)}`}>
                    {valuation}
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Early MVP valuation indicator based on simple price and size heuristics. Later this
                    can be upgraded with earnings, growth, and sector comparisons.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Frequently Asked Questions</div>

          <div className="mt-5 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-white">Is {stock.ticker} a good stock?</h2>
              <p className="mt-2 leading-8 text-slate-300">
                StockScore AI currently scores {stock.ticker} at {score}/100 based on momentum, valuation,
                sentiment, and risk indicators.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Is {stock.ticker} overvalued?</h2>
              <p className="mt-2 leading-8 text-slate-300">
                StockScore AI currently classifies {stock.ticker} as <span className={getValuationColor(valuation)}>{valuation}</span>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">Should I buy {stock.ticker}?</h2>
              <p className="mt-2 leading-8 text-slate-300">
                StockScore AI AI currently suggests: <span className={getRecommendationColor(recommendation)}>{recommendation}</span>.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Explore more</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Popular stocks</h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {relatedTickers
                .filter((item) => item !== stock.ticker)
                .map((item) => (
                  <Link
                    key={item}
                    href={`/stock/${item}`}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
                  >
                    {item}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}