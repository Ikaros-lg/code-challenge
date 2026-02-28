/** Input shape for price data (API-agnostic). */
export type PriceDatum = {
  currency: string;
  price: number;
};

/**
 * Builds a map of token -> price (deduplicated by currency, keeps highest price).
 * Pure function: no side effects, easy to test.
 */
export function buildTokenPrices(rows: PriceDatum[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const { currency, price } of rows) {
    if (!out[currency] || price > out[currency]) {
      out[currency] = price
    }
  }
  return out
}

/** Returns token list from a price map (e.g. from buildTokenPrices). */
export function getTokensFromPrices(prices: Record<string, number>): string[] {
  return Object.keys(prices)
}

/** Max amount per token to prevent draining wallet (balance cap). */
const DEFAULT_MAX = 1000
export const TOKEN_MAX: Record<string, number> = {
  ETH: 2.5,
  WBTC: 0.1,
  USDC: 10000,
  BUSD: 10000,
  USD: 10000,
  axlUSDC: 10000,
  USC: 10000,
  YieldUSD: 5000,
  ATOM: 100,
  bNEO: 50,
  BLUR: 500,
  GMX: 20,
  STEVMOS: 500,
  LUNA: 200,
  RATOM: 50,
  STRD: 200,
  EVMOS: 500,
  IBCX: 10,
  IRIS: 2000,
  ampLUNA: 200,
  KUJI: 200,
  STOSMO: 200,
  STATOM: 50,
  OSMO: 500,
  rSWTH: 50000,
  STLUNA: 200,
  LSI: 5,
  OKB: 10,
  OKT: 30,
  SWTH: 50000,
  wstETH: 1,
  ZIL: 10000,
}

export function getTokenMax(currency: string): number {
  return TOKEN_MAX[currency] ?? DEFAULT_MAX
}
