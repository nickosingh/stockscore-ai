"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { POPULAR_STOCKS } from "@/app/lib/watchlists";

export default function StockScoreAILandingPage() {
  const router = useRouter();

  const [ticker, setTicker] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const popularStocks = POPULAR_STOCKS;

  const sample = {
    name: "NVIDIA",
    ticker: "NVDA",
    score: 91,
    trend: "Uptrend",
    risk: "Medium",
    sentiment: "Bullish",
    summary:
      "Nvidia shows strong momentum, strong market confidence, and continued AI-driven demand, though volatility remains elevated.",
  };

  function searchStock() {
    const cleaned = ticker.trim().toUpperCase();
    if (!cleaned) return;
    router.push(`/stock/${cleaned}`);
  }

  function goToTicker(symbol: string) {
    router.push(`/stock/${symbol}`);
  }

  async function joinEarlyAccess() {
    const cleanedEmail = email.trim();

    if (!cleanedEmail) {
      setMessage("Please enter an email address.");
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage("");

      const res = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: cleanedEmail }),
      });

      const data = await res.json();

      if (data.ok) {
        setMessage("You're on the list!");
        setEmail("");
      } else {
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/20 text-lg font-bold text-emerald-300">
              S
            </div>
            <div>
              <div className="text-lg font-semibold tracking-tight">StockScore AI</div>
              <div className="text-xs text-slate-400">Understand any stock in 10 seconds</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/top-stocks"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Top Stocks
            </Link>

            <Link
              href="/portfolio"
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Portfolio Score
            </Link>

            <Link
              href="/roast"
              className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-2 text-sm text-rose-300 transition hover:bg-rose-400/20"
            >
              Roast My Portfolio
            </Link>

            <a
              href="#early-access"
              className="cursor-pointer rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
            >
              Join Early Access
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <div className="mb-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-300">
              Simple AI stock scoring for retail investors
            </div>

            <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-white md:text-6xl">
              Understand any stock in 10 seconds
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-300">
              StockScore AI turns confusing market data into a simple stock health score, trend signal,
              risk view, and plain-English AI explanation.
            </p>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/20">
              <label className="mb-3 block text-sm font-medium text-slate-300">Enter a ticker</label>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  placeholder="e.g. NVDA"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      searchStock();
                    }
                  }}
                  className="flex-1 rounded-2xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none ring-0 placeholder:text-slate-500"
                />

                <button
                  onClick={searchStock}
                  className="cursor-pointer rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Check Stock
                </button>

                <Link
                  href="/top-stocks"
                  className="rounded-2xl border border-white/10 px-6 py-3 text-center font-semibold text-slate-200 transition hover:bg-white/5"
                >
                  Top Stocks Today
                </Link>
              </div>

              <div className="mt-3 text-sm text-slate-400">
                Try:{" "}
                {popularStocks.slice(0, 12).map((symbol, index) => (
                  <span key={symbol}>
                    <button
                      onClick={() => goToTicker(symbol)}
                      className="mx-1 cursor-pointer text-emerald-300 hover:text-emerald-200"
                    >
                      {symbol}
                    </button>
                    {index < popularStocks.length - 1 ? (
                      <span className="text-slate-600">•</span>
                    ) : null}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-rose-400/20 bg-rose-400/10 p-5">
              <div className="text-sm uppercase tracking-[0.2em] text-rose-300">Viral feature</div>
              <h2 className="mt-2 text-2xl font-bold tracking-tight">AI Roast My Portfolio</h2>
              <p className="mt-3 max-w-xl leading-7 text-slate-200">
                Paste your holdings and let StockScore AI roast your portfolio with brutal honesty.
                Funny enough to share. Useful enough to remember.
              </p>
              <div className="mt-5">
                <Link
                  href="/roast"
                  className="inline-flex rounded-2xl bg-rose-400 px-5 py-3 font-semibold text-slate-950 transition hover:scale-[1.01]"
                >
                  Try Roast My Portfolio
                </Link>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl" />

            <div className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 p-6 shadow-2xl shadow-black/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Live example</div>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {sample.name} <span className="text-slate-400">({sample.ticker})</span>
                  </h2>
                </div>
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm text-emerald-300">
                  Strong
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-[1.1fr,0.9fr]">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm text-slate-400">StockScore AI Score</div>
                  <div className="mt-4 flex items-end gap-3">
                    <div className="text-6xl font-bold text-white">{sample.score}</div>
                    <div className="pb-2 text-xl text-slate-400">/100</div>
                  </div>
                  <div className="mt-5 h-3 rounded-full bg-white/10">
                    <div className="h-3 w-[91%] rounded-full bg-emerald-400" />
                  </div>
                  <div className="mt-3 text-sm text-slate-400">
                    Strong momentum with healthy fundamentals
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Trend</div>
                    <div className="mt-2 text-lg font-semibold text-emerald-300">{sample.trend}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Risk</div>
                    <div className="mt-2 text-lg font-semibold text-amber-300">{sample.risk}</div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Sentiment</div>
                    <div className="mt-2 text-lg font-semibold text-cyan-300">{sample.sentiment}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-xs uppercase tracking-wide text-slate-500">AI explanation</div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{sample.summary}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-white/[0.02]">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Stock research is too complicated
              </h2>
              <p className="mt-4 text-slate-400">
                Too many charts. Too much jargon. Too little clarity.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {[
                [
                  "Too many charts",
                  "Most investors do not need 15 technical indicators just to understand a stock.",
                ],
                [
                  "Too much jargon",
                  "Financial language turns a simple decision into a confusing research exercise.",
                ],
                [
                  "Too little clarity",
                  "You still end up asking the same question: is this stock actually healthy?",
                ],
              ].map(([title, body]) => (
                <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="mt-3 leading-7 text-slate-400">{body}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 rounded-[32px] border border-emerald-400/20 bg-emerald-400/10 p-8 text-center">
              <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">The solution</div>
              <div className="mt-2 text-3xl font-bold tracking-tight text-white">
                StockScore AI simplifies it into one score
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">How StockScore AI works</h2>
            <p className="mt-4 text-slate-400">Three steps. No finance degree required.</p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["1", "Search a ticker", "Type any stock symbol to instantly pull the latest stock view."],
              ["2", "See the StockScore AI score", "Get a simple health score out of 100 with instant labels."],
              [
                "3",
                "Understand the stock instantly",
                "Read a plain-English AI summary that explains what matters.",
              ],
            ].map(([num, title, body]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400 text-lg font-bold text-slate-950">
                  {num}
                </div>
                <h3 className="mt-5 text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {[
              ["StockScore AI Score", "An overall stock health score out of 100."],
              ["Trend", "See whether the stock is moving up, sideways, or down."],
              ["Risk", "Understand volatility at a glance."],
              ["AI Explanation", "Plain-English reasoning instead of complex jargon."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-6">
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 leading-7 text-slate-400">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Try popular stocks</h2>
              <p className="mt-3 text-slate-400">Jump straight in with the most searched names.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {popularStocks.map((symbol) => (
              <button
                key={symbol}
                onClick={() => goToTicker(symbol)}
                className="cursor-pointer rounded-2xl border border-white/10 bg-white/5 px-5 py-3 font-medium text-slate-200 transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-emerald-300"
              >
                {symbol}
              </button>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-[32px] border border-white/10 bg-white/5 p-8">
              <div className="text-sm uppercase tracking-[0.2em] text-slate-500">Made to be shared</div>
              <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
                Simple scores people will want to post
              </h2>
              <p className="mt-4 max-w-xl leading-8 text-slate-400">
                StockScore AI pages are built to be visual, easy to understand, and naturally shareable
                across social media, group chats, and investing communities.
              </p>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-8">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm text-slate-400">My StockScore AI score for Tesla</div>
                <div className="mt-4 flex items-end gap-3">
                  <div className="text-5xl font-bold">74</div>
                  <div className="pb-1 text-lg text-slate-500">/100</div>
                </div>
                <div className="mt-4 flex gap-3 text-sm">
                  <span className="rounded-full bg-amber-400/10 px-3 py-1 text-amber-300">
                    Risk: High
                  </span>
                  <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-cyan-300">
                    Trend: Mixed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="early-access" className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-[32px] border border-white/10 bg-emerald-400/10 p-8 text-center md:p-12">
            <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">Early access</div>
            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Get early access to top stock signals
            </h2>
            <p className="mx-auto mt-4 max-w-2xl leading-8 text-slate-300">
              Be first to access watchlists, alerts, portfolio scoring, and daily AI stock briefings.
            </p>

            <div className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
              <input
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    joinEarlyAccess();
                  }
                }}
                className="flex-1 rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none placeholder:text-slate-500"
              />
              <button
                onClick={joinEarlyAccess}
                disabled={isSubmitting}
                className="cursor-pointer rounded-2xl bg-emerald-400 px-6 py-3 font-semibold text-slate-950 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Joining..." : "Join Early Access"}
              </button>
            </div>

            {message ? <p className="mt-3 text-sm text-emerald-300">{message}</p> : null}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">StockScore AI</div>
              <div className="mt-2 text-sm text-slate-500">
                StockScore AI provides informational insights only and does not provide financial advice.
              </div>
            </div>

            <div className="flex flex-wrap gap-5 text-sm text-slate-400">
              <a href="#" className="hover:text-white">
                About
              </a>
              <a href="#" className="hover:text-white">
                Contact
              </a>
              <a href="#" className="hover:text-white">
                Privacy
              </a>
              <a href="#" className="hover:text-white">
                Terms
              </a>
              <a href="#" className="hover:text-white">
                Disclaimer
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}