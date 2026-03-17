"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type RoastResult = {
  score: number;
  title: string;
  roast: string;
  risk: string;
  vibe: string;
};

function parsePortfolio(input: string): string[] {
  return input
    .split(/[\n,\s]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function getPortfolioScore(tickers: string[]) {
  let score = 70;

  const highRisk = ["TSLA", "COIN", "PLTR", "MSTR", "GME", "AMC", "BBBY", "DOGE"];
  const boringQuality = ["AAPL", "MSFT", "GOOGL", "AMZN", "META", "BRK.B"];
  const aiHype = ["NVDA", "AMD", "PLTR", "SMCI", "TSLA"];
  const memeNames = ["GME", "AMC", "BBBY", "DOGE", "COIN"];

  const unique = Array.from(new Set(tickers));
  const countHighRisk = unique.filter((t) => highRisk.includes(t)).length;
  const countBoring = unique.filter((t) => boringQuality.includes(t)).length;
  const countAi = unique.filter((t) => aiHype.includes(t)).length;
  const countMeme = unique.filter((t) => memeNames.includes(t)).length;

  score += countBoring * 4;
  score += Math.min(2, unique.length) * 2;
  score -= countHighRisk * 6;
  score -= countMeme * 5;

  if (countAi >= 3) score -= 6;
  if (unique.length <= 2) score -= 8;
  if (unique.length >= 6) score += 4;

  return Math.max(25, Math.min(95, score));
}

function getRoastResult(tickers: string[]): RoastResult {
  const score = getPortfolioScore(tickers);
  const joined = tickers.join(", ");

  const has = (symbol: string) => tickers.includes(symbol);

  if (tickers.length === 0) {
    return {
      score: 0,
      title: "No Portfolio Found",
      roast: "You forgot to enter a portfolio. Even your cash account is showing more conviction than this.",
      risk: "Unknown",
      vibe: "Uncommitted",
    };
  }

  if ((has("GME") || has("AMC") || has("BBBY")) && (has("DOGE") || has("COIN"))) {
    return {
      score,
      title: "Reddit Chaos Basket",
      roast:
        "This portfolio looks like it was assembled entirely from Reddit threads written at 3am. Your investment process appears to be part meme, part adrenaline, and part complete disregard for consequences.",
      risk: "Very High",
      vibe: "YOLO Maximalist",
    };
  }

  if (has("NVDA") && has("TSLA") && (has("PLTR") || has("AMD") || has("SMCI"))) {
    return {
      score,
      title: "AI Hype Starter Pack",
      roast:
        "Your portfolio looks like a Silicon Valley AI conference afterparty. If AI sneezes, this portfolio catches pneumonia. Tremendous upside, but subtlety has clearly left the building.",
      risk: "High",
      vibe: "Future-Chasing",
    };
  }

  if (has("AAPL") && has("MSFT") && has("GOOGL") && has("AMZN") && has("META")) {
    return {
      score,
      title: "Magnificent Beige",
      roast:
        "Congratulations. You have built the most boringly competent portfolio imaginable. If this portfolio were a person, it would wear beige chinos, meal prep on Sundays, and rebalance quarterly for fun.",
      risk: "Medium",
      vibe: "Disciplined Dad Energy",
    };
  }

  if (tickers.length <= 2) {
    return {
      score,
      title: "Concentration Station",
      roast:
        `You currently own ${joined}. That is not a portfolio. That is a hostage situation. Diversification called, but your conviction portfolio sent it straight to voicemail.`,
      risk: "High",
      vibe: "All-In Energy",
    };
  }

  if (score >= 85) {
    return {
      score,
      title: "Suspiciously Sensible",
      roast:
        "This portfolio is annoyingly responsible. It has enough quality to sleep at night and just enough ambition to avoid dying of boredom. Frankly, it is difficult to roast because it has been built by an adult.",
      risk: "Low",
      vibe: "Responsible Builder",
    };
  }

  if (score >= 70) {
    return {
      score,
      title: "Mostly Under Control",
      roast:
        "This portfolio is walking the line between thoughtful investing and occasional impulsive enthusiasm. There is some logic here, but also just enough spice to suggest you have at least once bought a stock because the chart looked cool.",
      risk: "Medium",
      vibe: "Confident but Nervous",
    };
  }

  if (score >= 55) {
    return {
      score,
      title: "Aggressively Optimistic",
      roast:
        "This portfolio has strong main-character energy. It might make you look brilliant in a bull market, or humble you with spectacular efficiency the moment momentum turns. Bold? Yes. Balanced? Not especially.",
      risk: "Medium-High",
      vibe: "Hope-Driven",
    };
  }

  return {
    score,
    title: "Financial Extreme Sports",
    roast:
      "This portfolio is less an investment strategy and more a live-action stress test. You have built something with the emotional stability of a group chat trying to predict the market open. Respectfully: seek diversification.",
    risk: "High",
    vibe: "Chaos Trader",
  };
}

export default function RoastPage() {
  const [input, setInput] = useState(`NVDA
TSLA
PLTR
AMD`);
  const [showResult, setShowResult] = useState(false);
  const [copied, setCopied] = useState(false);

  const tickers = useMemo(() => parsePortfolio(input), [input]);
  const result = useMemo(() => getRoastResult(tickers), [tickers]);

  async function copyRoast() {
    const text = `StockScore AI AI Roast My Portfolio

Portfolio Score: ${result.score}/100
Title: ${result.title}
Risk: ${result.risk}
Vibe: ${result.vibe}

Roast:
${result.roast}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const shareText = encodeURIComponent(
    `StockScore AI roasted my portfolio 😭\n\nPortfolio Score: ${result.score}/100\n${result.roast}`
  );

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

          <div className="flex gap-3">
            <Link
              href="/portfolio"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Portfolio Score
            </Link>
            <Link
              href="/top-stocks"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Top Stocks
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <section className="grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
          <div className="rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/30 md:p-8">
            <div className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/10 px-3 py-1 text-sm text-rose-300">
              Viral feature
            </div>

            <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
              AI Roast My Portfolio
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
              Paste your portfolio and let StockScore AI roast it with brutal honesty.
              Funny enough to share. Useful enough to remember.
            </p>

            <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-4">
              <label className="mb-3 block text-sm font-medium text-slate-300">
                Enter your holdings
              </label>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                className="min-h-[240px] w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-4 font-mono text-sm text-white outline-none placeholder:text-slate-500"
                placeholder={`NVDA
TSLA
PLTR
AMD`}
              />

              <div className="mt-3 text-sm text-slate-400">
                One ticker per line, or paste comma-separated tickers.
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => setShowResult(true)}
                  className="cursor-pointer rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Roast My Portfolio
                </button>

                <button
                  onClick={() => {
                    setInput(`AAPL
MSFT
GOOGL
AMZN
META`);
                    setShowResult(true);
                  }}
                  className="cursor-pointer rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  Try boring portfolio
                </button>

                <button
                  onClick={() => {
                    setInput(`GME
AMC
DOGE
COIN`);
                    setShowResult(true);
                  }}
                  className="cursor-pointer rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                >
                  Try chaos portfolio
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-500">
                    Roast result
                  </div>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">Portfolio Score</h2>
                </div>

                {showResult ? (
                  <div
                    className={`rounded-2xl border px-3 py-2 text-sm ${
                      result.score >= 80
                        ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                        : result.score >= 65
                        ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                        : result.score >= 50
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        : "border-rose-400/20 bg-rose-400/10 text-rose-300"
                    }`}
                  >
                    {result.title}
                  </div>
                ) : null}
              </div>

              {showResult ? (
                <>
                  <div className="mt-6 flex items-end gap-3">
                    <div className="text-7xl font-bold leading-none text-white">{result.score}</div>
                    <div className="pb-2 text-2xl text-slate-500">/100</div>
                  </div>

                  <div className="mt-5 h-3 rounded-full bg-white/10">
                    <div
                      className="h-3 rounded-full bg-emerald-400"
                      style={{ width: `${result.score}%` }}
                    />
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Risk</div>
                      <div className="mt-2 text-xl font-semibold text-amber-300">{result.risk}</div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                      <div className="text-xs uppercase tracking-wide text-slate-500">Vibe</div>
                      <div className="mt-2 text-xl font-semibold text-cyan-300">{result.vibe}</div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-6">
                    <div className="text-xs uppercase tracking-wide text-rose-300">AI Roast</div>
                    <p className="mt-3 text-base leading-8 text-slate-100">{result.roast}</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={copyRoast}
                      className="cursor-pointer rounded-2xl bg-emerald-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.01]"
                    >
                      {copied ? "Copied!" : "Copy Roast"}
                    </button>

                    <a
                      href={`https://twitter.com/intent/tweet?text=${shareText}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cursor-pointer rounded-2xl border border-white/10 px-5 py-3 text-sm text-slate-200 transition hover:bg-white/5"
                    >
                      Share on X
                    </a>
                  </div>
                </>
              ) : (
                <div className="mt-6 rounded-[28px] border border-white/10 bg-slate-900/80 p-5 text-slate-300">
                  Enter a portfolio and click <span className="font-semibold text-white">Roast My Portfolio</span>.
                </div>
              )}
            </div>

            <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Why it spreads</div>
              <div className="mt-4 space-y-3 text-slate-300">
                <p>People love sharing funny results more than serious dashboards.</p>
                <p>A roast gives StockScore AI personality and makes screenshots worth posting.</p>
                <p>The best-performing portfolios are usually the funniest or most chaotic ones.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}