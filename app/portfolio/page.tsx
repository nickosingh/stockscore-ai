"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type ParsedHolding = {
  ticker: string;
  weight: number;
};

type AnalyzedHolding = ParsedHolding & {
  score: number;
  risk: "Low" | "Medium" | "High";
  sentiment: "Bullish" | "Neutral" | "Bearish";
};

const stockProfiles: Record<
  string,
  { score: number; risk: "Low" | "Medium" | "High"; sentiment: "Bullish" | "Neutral" | "Bearish" }
> = {
  AAPL: { score: 84, risk: "Low", sentiment: "Bullish" },
  NVDA: { score: 91, risk: "Medium", sentiment: "Bullish" },
  TSLA: { score: 74, risk: "High", sentiment: "Neutral" },
  MSFT: { score: 88, risk: "Low", sentiment: "Bullish" },
  AMZN: { score: 82, risk: "Medium", sentiment: "Bullish" },
  GOOGL: { score: 83, risk: "Low", sentiment: "Bullish" },
  META: { score: 80, risk: "Medium", sentiment: "Bullish" },
  AMD: { score: 77, risk: "High", sentiment: "Neutral" },
};

function parseHoldings(input: string): { holdings: ParsedHolding[]; errors: string[] } {
  const lines = input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const holdings: ParsedHolding[] = [];
  const errors: string[] = [];

  lines.forEach((line, index) => {
    const parts = line.split(/\s+/);

    if (parts.length < 2) {
      errors.push(`Line ${index + 1}: use format "TICKER WEIGHT"`);
      return;
    }

    const ticker = parts[0].toUpperCase();
    const weight = Number(parts[1]);

    if (!/^[A-Z.\-]+$/.test(ticker)) {
      errors.push(`Line ${index + 1}: invalid ticker "${parts[0]}"`);
      return;
    }

    if (Number.isNaN(weight) || weight <= 0) {
      errors.push(`Line ${index + 1}: invalid weight "${parts[1]}"`);
      return;
    }

    holdings.push({ ticker, weight });
  });

  return { holdings, errors };
}

function normalizeWeights(holdings: ParsedHolding[]): ParsedHolding[] {
  const total = holdings.reduce((sum, item) => sum + item.weight, 0);
  if (total <= 0) return holdings;
  return holdings.map((item) => ({
    ...item,
    weight: (item.weight / total) * 100,
  }));
}

function getFallbackProfile(ticker: string) {
  const seed = ticker
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const score = 55 + (seed % 26);
  const risk: "Low" | "Medium" | "High" = score >= 82 ? "Low" : score >= 68 ? "Medium" : "High";
  const sentiment: "Bullish" | "Neutral" | "Bearish" =
    score >= 78 ? "Bullish" : score >= 63 ? "Neutral" : "Bearish";

  return { score, risk, sentiment };
}

function riskToNumber(risk: "Low" | "Medium" | "High") {
  if (risk === "Low") return 1;
  if (risk === "Medium") return 2;
  return 3;
}

function numberToRisk(value: number): "Low" | "Medium" | "High" {
  if (value < 1.6) return "Low";
  if (value < 2.35) return "Medium";
  return "High";
}

function analyzePortfolio(holdings: ParsedHolding[]) {
  const normalized = normalizeWeights(holdings);

  const analyzed: AnalyzedHolding[] = normalized.map((item) => {
    const profile = stockProfiles[item.ticker] ?? getFallbackProfile(item.ticker);
    return {
      ...item,
      ...profile,
    };
  });

  const weightedScore =
    analyzed.reduce((sum, item) => sum + item.score * (item.weight / 100), 0);

  const avgRiskValue =
    analyzed.reduce((sum, item) => sum + riskToNumber(item.risk) * (item.weight / 100), 0);

  const avgRisk = numberToRisk(avgRiskValue);

  const bullishWeight = analyzed
    .filter((item) => item.sentiment === "Bullish")
    .reduce((sum, item) => sum + item.weight, 0);

  const bearishWeight = analyzed
    .filter((item) => item.sentiment === "Bearish")
    .reduce((sum, item) => sum + item.weight, 0);

  const sentiment =
    bullishWeight >= 55 ? "Bullish" : bearishWeight >= 35 ? "Bearish" : "Neutral";

  const topHolding = [...analyzed].sort((a, b) => b.weight - a.weight)[0];
  const top3Weight = [...analyzed]
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 3)
    .reduce((sum, item) => sum + item.weight, 0);

  let diversification = "Strong";
  let diversificationPenalty = 0;

  if (topHolding.weight > 45) {
    diversification = "Weak";
    diversificationPenalty += 12;
  } else if (topHolding.weight > 30) {
    diversification = "Moderate";
    diversificationPenalty += 6;
  }

  if (top3Weight > 80) {
    diversification = "Weak";
    diversificationPenalty += 8;
  } else if (top3Weight > 65) {
    diversification = diversification === "Weak" ? "Weak" : "Moderate";
    diversificationPenalty += 4;
  }

  const highRiskWeight = analyzed
    .filter((item) => item.risk === "High")
    .reduce((sum, item) => sum + item.weight, 0);

  const riskPenalty = highRiskWeight > 45 ? 8 : highRiskWeight > 25 ? 4 : 0;

  const finalScore = Math.max(1, Math.min(99, Math.round(weightedScore - diversificationPenalty - riskPenalty)));

  const strengths: string[] = [];
  const risks: string[] = [];

  if (finalScore >= 80) {
    strengths.push("Overall portfolio quality looks strong.");
  } else if (finalScore >= 70) {
    strengths.push("Portfolio health looks reasonably solid.");
  } else {
    risks.push("Overall portfolio quality is mixed.");
  }

  if (bullishWeight >= 55) {
    strengths.push("A large portion of holdings have positive sentiment.");
  }

  if (avgRisk === "Low") {
    strengths.push("Average portfolio volatility appears relatively controlled.");
  } else if (avgRisk === "High") {
    risks.push("Average portfolio volatility is elevated.");
  }

  if (topHolding.weight > 30) {
    risks.push(`${topHolding.ticker} is a large concentration at ${topHolding.weight.toFixed(1)}%.`);
  }

  if (top3Weight > 65) {
    risks.push(`Top 3 holdings make up ${top3Weight.toFixed(1)}% of the portfolio.`);
  }

  if (highRiskWeight > 25) {
    risks.push(`${highRiskWeight.toFixed(1)}% of the portfolio is in high-risk holdings.`);
  }

  if (strengths.length === 0) {
    strengths.push("The portfolio has at least some spread across multiple holdings.");
  }

  if (risks.length === 0) {
    risks.push("No major concentration warning was detected in this MVP view.");
  }

  const summary = buildPortfolioSummary({
    finalScore,
    diversification,
    avgRisk,
    sentiment,
    topHolding,
    top3Weight,
    highRiskWeight,
  });

  return {
    holdings: analyzed,
    weightedScore: Math.round(weightedScore),
    finalScore,
    diversification,
    avgRisk,
    sentiment,
    strengths,
    risks,
    summary,
  };
}

function buildPortfolioSummary({
  finalScore,
  diversification,
  avgRisk,
  sentiment,
  topHolding,
  top3Weight,
  highRiskWeight,
}: {
  finalScore: number;
  diversification: string;
  avgRisk: "Low" | "Medium" | "High";
  sentiment: "Bullish" | "Neutral" | "Bearish";
  topHolding: AnalyzedHolding;
  top3Weight: number;
  highRiskWeight: number;
}) {
  let opener = "";

  if (finalScore >= 85) opener = "Your portfolio looks very healthy overall.";
  else if (finalScore >= 70) opener = "Your portfolio looks reasonably healthy overall.";
  else if (finalScore >= 55) opener = "Your portfolio looks mixed overall.";
  else opener = "Your portfolio currently looks fragile overall.";

  return `${opener} Diversification is ${diversification.toLowerCase()}, average risk is ${avgRisk.toLowerCase()}, and overall sentiment is ${sentiment.toLowerCase()}. Your largest position is ${topHolding.ticker} at ${topHolding.weight.toFixed(
    1
  )}%, the top 3 holdings account for ${top3Weight.toFixed(
    1
  )}%, and high-risk exposure is ${highRiskWeight.toFixed(1)}%.`;
}

function scoreTone(score: number) {
  if (score >= 85) return "text-emerald-300 border-emerald-400/20 bg-emerald-400/10";
  if (score >= 70) return "text-cyan-300 border-cyan-400/20 bg-cyan-400/10";
  if (score >= 55) return "text-amber-300 border-amber-400/20 bg-amber-400/10";
  return "text-rose-300 border-rose-400/20 bg-rose-400/10";
}

export default function PortfolioPage() {
  const [input, setInput] = useState(`AAPL 30
NVDA 25
TSLA 20
MSFT 25`);

  const parsed = useMemo(() => parseHoldings(input), [input]);
  const analysis = useMemo(() => {
    if (parsed.errors.length > 0 || parsed.holdings.length === 0) return null;
    return analyzePortfolio(parsed.holdings);
  }, [parsed]);

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

          <div className="flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Home
            </Link>

            <Link
              href="/roast"
              className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-400/20"
            >
              Roast My Portfolio
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/30 md:p-8">
            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
              Portfolio Health Score
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              Analyze your portfolio in seconds
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Paste your holdings one per line using the format{" "}
              <span className="font-semibold text-white">TICKER WEIGHT</span>.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
              <label className="mb-3 block text-sm font-medium text-slate-300">
                Holdings input
              </label>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className="min-h-[260px] w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 font-mono text-sm text-white outline-none placeholder:text-slate-500"
                placeholder={`AAPL 30
NVDA 25
TSLA 20
MSFT 25`}
              />

              <div className="mt-3 text-sm text-slate-400">
                Example:
                <span className="ml-2 text-emerald-300">AAPL 30</span>
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-emerald-300">NVDA 25</span>
                <span className="mx-2 text-slate-600">•</span>
                <span className="text-emerald-300">TSLA 20</span>
              </div>
            </div>

            {parsed.errors.length > 0 ? (
              <div className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-5">
                <div className="text-sm uppercase tracking-[0.2em] text-rose-300">Input issues</div>
                <div className="mt-3 space-y-2 text-sm text-slate-200">
                  {parsed.errors.map((error) => (
                    <div key={error}>{error}</div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-6 rounded-[28px] border border-white/10 bg-white/5 p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">What this MVP does</div>
              <p className="mt-3 leading-8 text-slate-300">
                It calculates a weighted portfolio score, checks concentration risk, estimates
                average risk, and generates a simple plain-English summary.
              </p>
            </div>

            <div className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-rose-300">Viral version</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">Want the funny version?</h2>
              <p className="mt-3 leading-8 text-slate-200">
                Get your serious portfolio score here, then jump to the viral version and let
                StockScore AI roast your holdings with brutal honesty.
              </p>
              <div className="mt-5">
                <Link
                  href="/roast"
                  className="inline-flex rounded-2xl bg-rose-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Roast My Portfolio
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Portfolio result
                  </div>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">Health Score</h2>
                </div>

                {analysis ? (
                  <div
                    className={`rounded-2xl border px-3 py-2 text-sm ${scoreTone(
                      analysis.finalScore
                    )}`}
                  >
                    {analysis.finalScore >= 85
                      ? "Strong"
                      : analysis.finalScore >= 70
                      ? "Healthy"
                      : analysis.finalScore >= 55
                      ? "Mixed"
                      : "High Risk"}
                  </div>
                ) : null}
              </div>

              {analysis ? (
                <>
                  <div className="mt-6 flex items-end gap-3">
                    <div className="text-7xl font-bold leading-none text-white">
                      {analysis.finalScore}
                    </div>
                    <div className="pb-2 text-2xl text-slate-500">/100</div>
                  </div>

                  <div className="mt-5 h-3 rounded-full bg-white/10">
                    <div
                      className="h-3 rounded-full bg-emerald-400"
                      style={{ width: `${analysis.finalScore}%` }}
                    />
                  </div>

                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Diversification
                      </div>
                      <div className="mt-2 text-xl font-semibold text-cyan-300">
                        {analysis.diversification}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Avg Risk
                      </div>
                      <div
                        className={`mt-2 text-xl font-semibold ${
                          analysis.avgRisk === "Low"
                            ? "text-cyan-300"
                            : analysis.avgRisk === "Medium"
                            ? "text-amber-300"
                            : "text-rose-300"
                        }`}
                      >
                        {analysis.avgRisk}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">
                        Sentiment
                      </div>
                      <div
                        className={`mt-2 text-xl font-semibold ${
                          analysis.sentiment === "Bullish"
                            ? "text-cyan-300"
                            : analysis.sentiment === "Neutral"
                            ? "text-amber-300"
                            : "text-rose-300"
                        }`}
                      >
                        {analysis.sentiment}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-5">
                    <div className="text-xs uppercase tracking-wide text-slate-500">
                      AI-style summary
                    </div>
                    <p className="mt-3 text-base leading-8 text-slate-300">{analysis.summary}</p>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 text-slate-300">
                  Enter valid holdings to see your portfolio score.
                </div>
              )}
            </div>

            {analysis ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Strengths
                  </div>
                  <div className="mt-4 space-y-3">
                    {analysis.strengths.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Risks</div>
                  <div className="mt-4 space-y-3">
                    {analysis.risks.map((item) => (
                      <div
                        key={item}
                        className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-slate-200"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {analysis ? (
          <section className="mt-8 rounded-[32px] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                  Portfolio breakdown
                </div>
                <h2 className="mt-2 text-2xl font-bold tracking-tight">Holdings</h2>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="text-sm text-slate-500">
                  <tr className="border-b border-white/10">
                    <th className="pb-3 pr-6 font-medium">Ticker</th>
                    <th className="pb-3 pr-6 font-medium">Weight</th>
                    <th className="pb-3 pr-6 font-medium">Score</th>
                    <th className="pb-3 pr-6 font-medium">Risk</th>
                    <th className="pb-3 pr-6 font-medium">Sentiment</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.holdings.map((holding) => (
                    <tr key={holding.ticker} className="border-b border-white/5 text-slate-200">
                      <td className="py-4 pr-6 font-semibold">{holding.ticker}</td>
                      <td className="py-4 pr-6">{holding.weight.toFixed(1)}%</td>
                      <td className="py-4 pr-6">{holding.score}</td>
                      <td
                        className={`py-4 pr-6 ${
                          holding.risk === "Low"
                            ? "text-cyan-300"
                            : holding.risk === "Medium"
                            ? "text-amber-300"
                            : "text-rose-300"
                        }`}
                      >
                        {holding.risk}
                      </td>
                      <td
                        className={`py-4 pr-6 ${
                          holding.sentiment === "Bullish"
                            ? "text-cyan-300"
                            : holding.sentiment === "Neutral"
                            ? "text-amber-300"
                            : "text-rose-300"
                        }`}
                      >
                        {holding.sentiment}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}