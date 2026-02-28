import { useCallback, useState } from 'react'
import { TokenSelect } from '@/features/tokens/ui/TokenSelect'
import { getTokenMax } from '@/features/tokens/model/tokens'
import { usePrices } from '@/features/tokens/model/usePrices'
import { Toast, type ToastItem } from '@/shared/ui/Toast'

export default function App() {
  const { tokenPrices, tokens, loading: pricesLoading, error: pricesError, refetch: refetchPrices } = usePrices()
  const [fromToken, setFromToken] = useState('')
  const [toToken, setToToken] = useState('')
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const effectiveFromToken = fromToken || tokens[0] || ''
  const effectiveToToken = toToken || (tokens[1] ?? tokens[0] ?? '')

  const addToast = (toast: Omit<ToastItem, 'id'>) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      5000,
    )
  }

  const getRate = useCallback(() => {
    const fromP = tokenPrices[effectiveFromToken]
    const toP = tokenPrices[effectiveToToken]
    if (fromP === null || toP === null || toP === 0) {return 0}
    return fromP / toP
  }, [tokenPrices, effectiveFromToken, effectiveToToken])

  const handleFromChange = (val: string) => {
    setFromAmount(val)
    setError('')
    const numeric = Number(val)
    if (val && !Number.isNaN(numeric) && numeric > 0) {
      const out = (numeric * getRate()).toFixed(6)
      setToAmount(out)
      const maxAllowed = getTokenMax(effectiveFromToken)
      if (numeric > maxAllowed) {
        setError(`Insufficient balance. Maximum: ${maxAllowed} ${effectiveFromToken}`)
      }
    } else {
      setToAmount('')
    }
  }

  const handleToChange = (val: string) => {
    setToAmount(val)
    setError('')
    const numeric = Number(val)
    if (val && !Number.isNaN(numeric) && numeric > 0) {
      const inv = (numeric / getRate()).toFixed(6)
      setFromAmount(inv)
      const derivedFrom = Number(inv)
      const maxAllowed = getTokenMax(effectiveFromToken)
      if (derivedFrom > maxAllowed) {
        setError(`Insufficient balance. Maximum: ${maxAllowed} ${effectiveFromToken}`)
      }
    } else {
      setFromAmount('')
    }
  }

  const handleSwapTokens = () => {
    setFromToken(effectiveToToken)
    setToToken(effectiveFromToken)
    setFromAmount(toAmount)
    setToAmount(fromAmount)
  }

  const validate = () => {
    const numeric = Number(fromAmount)
    if (!fromAmount || Number.isNaN(numeric) || numeric <= 0) {
      setError('Please enter a valid amount to send.')
      return false
    }
    const maxAllowed = getTokenMax(effectiveFromToken)
    if (numeric > maxAllowed) {
      setError(`Insufficient balance. Maximum: ${maxAllowed} ${effectiveFromToken}`)
      return false
    }
    if (effectiveFromToken === effectiveToToken) {
      setError('Please select different tokens to swap.')
      return false
    }
    if (numeric < 0.000001) {
      setError('Amount is too small to swap.')
      return false
    }
    return true
  }

  const handleSubmit: React.ComponentProps<'form'>['onSubmit'] =
    async (e) => {
      e.preventDefault()
      if (!validate()) {return}
      setLoading(true)
      await new Promise((r) => setTimeout(r, 1800))
      setLoading(false)

      const rate = getRate().toFixed(6)
      const txn = Math.random().toString(36).slice(2, 10).toUpperCase()
      const time = new Date().toLocaleTimeString()
      addToast({
        type: 'success',
        from: effectiveFromToken,
        to: effectiveToToken,
        fromAmount: Number(fromAmount).toFixed(6),
        toAmount: Number(toAmount).toFixed(6),
        rate,
        txn,
        time,
      })
      setFromAmount('')
      setToAmount('')
    }

  const rate = getRate()
  const fromNumeric = Number(fromAmount)
  const toNumeric = Number(toAmount)

  // Max is always based on the token you SEND
  const maxSendAmount = getTokenMax(effectiveFromToken)
  const maxReceiveAmount = maxSendAmount * rate

  const fromUsdValue =
    fromAmount && !Number.isNaN(fromNumeric) && tokenPrices[effectiveFromToken] !== null
      ? (fromNumeric * tokenPrices[effectiveFromToken]).toFixed(2)
      : null
  const toUsdValue =
    toAmount && !Number.isNaN(toNumeric) && tokenPrices[effectiveToToken] !== null
      ? (toNumeric * tokenPrices[effectiveToToken]).toFixed(2)
      : null

  const formatMaxReceive = (max: number) =>
    max >= 1 ? max.toFixed(2) : max.toFixed(6)

  if (pricesLoading && tokens.length === 0) {
    return (
      <div className="flex min-h-screen min-w-full items-center justify-center bg-[#060d14] font-mono">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
          <span className="text-sm">Loading prices…</span>
        </div>
      </div>
    )
  }

  if (pricesError) {
    return (
      <div className="flex min-h-screen min-w-full items-center justify-center bg-[#060d14] p-5 font-mono">
        <div className="flex max-w-md flex-col items-center gap-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-6 py-8 text-center">
          <span className="text-red-300">Failed to load prices</span>
          <p className="text-sm text-slate-400">{pricesError}</p>
          <button
            type="button"
            onClick={() => refetchPrices()}
            className="rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-bold text-emerald-300 transition-colors hover:bg-emerald-400/20"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen min-w-full items-center justify-center overflow-hidden bg-[linear-gradient(135deg,#060d14_0%,#0a1628_50%,#060d14_100%)] p-3 font-mono sm:p-5">
      <Toast toasts={toasts} />

      {/* Background orbs */}
      <div className="pointer-events-none absolute left-[15%] top-[10%] h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,255,200,0.04)_0%,transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-[15%] right-[10%] h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.06)_0%,transparent_70%)]" />

      <div className="w-full max-w-[480px] rounded-[28px] border border-white/10 bg-[linear-gradient(160deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.02)_100%)] shadow-[0_32px_80px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 pt-5 sm:px-7 sm:pt-7">
          <div>
            <div className="font-display text-[18px] font-black tracking-[0.2em] text-emerald-300 sm:text-[22px]">
              SWAP
            </div>
            <div className="mt-0.5 text-[10px] text-slate-500">
              Trade tokens instantly
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              <span className="text-[10px] text-emerald-300">LIVE</span>
            </div>
            <div className="max-w-[140px] truncate text-[9px] text-slate-700 sm:max-w-none">
              1 {effectiveFromToken} = {rate.toFixed(4)} {effectiveToToken}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 px-4 pb-5 pt-5 sm:px-7 sm:pb-7 sm:pt-6"
        >
          {/* From */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500">
              You Send
            </label>
            <div
              className={`flex items-center gap-2 rounded-2xl border bg-white/5 px-4 py-3 transition-colors ${
                error ? 'border-red-400/60' : 'border-white/10'
              }`}
            >
              <div className="min-w-0 flex-1">
                <input
                  type="number"
                  placeholder="0.00"
                  value={fromAmount}
                  onChange={(e) => handleFromChange(e.target.value)}
                  className="w-full border-none bg-transparent text-xl font-bold text-sky-100 outline-none placeholder:text-slate-600 sm:text-2xl"
                />
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                  {fromUsdValue !== null && <span>≈ ${fromUsdValue} USD</span>}
                  <span>
                    Max: {maxSendAmount} {effectiveFromToken}
                  </span>
                </div>
              </div>
              <TokenSelect
                tokens={tokens}
                tokenPrices={tokenPrices}
                value={effectiveFromToken}
                onChange={setFromToken}
                exclude={effectiveToToken}
              />
            </div>
          </div>

          {/* Flip */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleSwapTokens}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-400/40 bg-white/5 text-lg text-emerald-300 transition-transform transition-colors hover:-rotate-180 hover:bg-emerald-400/15"
            >
              ⇅
            </button>
          </div>

          {/* To */}
          <div className="space-y-2">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-slate-500">
              You Receive
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 px-4 py-3">
              <div className="min-w-0 flex-1">
                <input
                  type="number"
                  placeholder="0.00"
                  value={toAmount}
                  onChange={(e) => handleToChange(e.target.value)}
                  className="w-full border-none bg-transparent text-xl font-bold text-emerald-300 outline-none placeholder:text-slate-600 sm:text-2xl"
                />
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
                  {toUsdValue !== null && <span>≈ ${toUsdValue} USD</span>}
                  <span>
                    Max: {formatMaxReceive(maxReceiveAmount)} {effectiveToToken}
                  </span>
                </div>
              </div>
              <TokenSelect
                tokens={tokens}
                tokenPrices={tokenPrices}
                value={effectiveToToken}
                onChange={setToToken}
                exclude={effectiveFromToken}
              />
            </div>
          </div>

          {/* Rate info */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-[11px] text-slate-500">
            <span>Exchange Rate</span>
            <span className="text-sky-200">
              1 {effectiveFromToken} = {rate.toFixed(6)} {effectiveToToken}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-400/60 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
              <span>⚠</span>
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !fromAmount || !!error}
            className={`font-display flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-sm font-black tracking-[0.2em] shadow-[0_8px_24px_rgba(16,185,129,0.5)] transition-all ${
              loading || !fromAmount || error
                ? 'cursor-not-allowed bg-emerald-400/40 text-slate-900'
                : 'cursor-pointer bg-gradient-to-r from-emerald-300 to-teal-400 text-slate-900 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(16,185,129,0.6)]'
            }`}
          >
            {loading ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[rgba(6,13,20,0.3)] border-t-[#060d14]" />
                SWAPPING...
              </>
            ) : (
              'CONFIRM SWAP'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
