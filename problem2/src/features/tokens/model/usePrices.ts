import { useCallback, useEffect, useState } from 'react'

import { fetchPrices } from '@/features/tokens/api/pricesApi'
import {
  buildTokenPrices,
  getTokensFromPrices,
  type PriceDatum,
} from '@/features/tokens/model/tokens'

export type PricesState = {
  tokenPrices: Record<string, number>;
  tokens: string[];
  loading: boolean;
  error: string | null;
};

export function usePrices(): PricesState & { refetch: () => Promise<void> } {
  const [tokenPrices, setTokenPrices] = useState<Record<string, number>>({})
  const [tokens, setTokens] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (opts?: { force?: boolean }) => {
    setLoading(true)
    setError(null)
    try {
      const rows = await fetchPrices(opts)
      const data: PriceDatum[] = rows.map(({ currency, price }) => ({
        currency,
        price,
      }))
      const prices = buildTokenPrices(data)
      setTokenPrices(prices)
      setTokens(getTokensFromPrices(prices))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load prices')
      setTokenPrices({})
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const refetch = useCallback(() => load({ force: true }), [load])

  return { tokenPrices, tokens, loading, error, refetch }
}
