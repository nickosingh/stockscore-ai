"use client";

import { useState } from "react";

type ShareButtonsProps = {
  ticker: string;
  score: number;
};

export default function ShareButtons({ ticker, score }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const shareText = `My StockScore AI score for ${ticker} is ${score}/100. Check yours on StockScore AI.`;

  async function copyShareText() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="mt-6 flex flex-wrap gap-3">
      <button
        onClick={copyShareText}
        className="cursor-pointer rounded-2xl bg-emerald-400 px-4 py-2 font-semibold text-slate-950 transition hover:scale-[1.01]"
      >
        {copied ? "Copied!" : "Copy Share Text"}
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="cursor-pointer rounded-2xl border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
      >
        Share on X
      </a>
    </div>
  );
}