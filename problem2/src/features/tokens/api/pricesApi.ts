export const PRICES_API_URL = 'https://interview.switcheo.com/prices.json'

export type PriceRow = {
  currency: string;
  date: string;
  price: number;
};

let inFlight: Promise<PriceRow[]> | null = null
let cached: PriceRow[] | null = null

/**
 * Fetches price rows.
 * - inFlight: Dedupes concurrent calls by React StrictMode dounle-mount.
 * - cached: Caches the last successful result.
 */
export async function fetchPrices(options?: { force?: boolean }): Promise<PriceRow[]> {
  if (!options?.force && cached) {
    return cached
  }

  if (!options?.force && inFlight) {
    return inFlight
  }

  inFlight = (async () => {
    const res = await fetch(PRICES_API_URL, { cache: 'no-store' })
    if (!res.ok) {
      throw new Error(`Failed to load prices: ${res.status} ${res.statusText}`)
    }
    const data = (await res.json()) as PriceRow[]
    cached = data
    return data
  })().finally(() => {
    inFlight = null
  })

  return inFlight
}
