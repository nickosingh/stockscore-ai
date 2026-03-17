import YahooFinance from "yahoo-finance2";
import { NextResponse } from "next/server";

const yahooFinance = new YahooFinance();

export async function GET(
  request: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker } = await context.params;
    const symbol = ticker.toUpperCase();

    const quote = await yahooFinance.quote(symbol);

    return NextResponse.json({
      ok: true,
      ticker: symbol,
      name: quote.shortName ?? quote.longName ?? symbol,
      price: quote.regularMarketPrice ?? null,
      change: quote.regularMarketChange ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      marketCap: quote.marketCap ?? null,
    });
  } catch (error) {
    console.error("Stock API error:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch stock data",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}