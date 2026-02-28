import { useEffect, useRef, useState } from 'react'

import { TokenIcon } from '@/features/tokens/ui/TokenIcon'

export type TokenSelectProps = {
  tokens: string[];
  tokenPrices: Record<string, number>;
  value: string;
  onChange: (token: string) => void;
  exclude?: string;
};

export function TokenSelect({
  tokens,
  tokenPrices,
  value,
  onChange,
  exclude,
}: Readonly<TokenSelectProps>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement | null>(null)
  const searchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (open) {
      // Focus after render so the dropdown is interactive immediately.
      queueMicrotask(() => searchRef.current?.focus())
    }
  }, [open])

  const filtered = tokens.filter((t) => {
    if (t === exclude) {return false}
    return t.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="relative shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-w-[92px] items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-2.5 py-2 text-[12px] font-bold text-sky-100 transition-colors hover:border-emerald-300/70 hover:bg-white/15 sm:min-w-[110px] sm:px-3 sm:text-[13px]"
      >
        <TokenIcon token={value} size={22} />
        {value}
        <span className="ml-auto opacity-60">▾</span>
      </button>
      <div
        className={`absolute right-0 top-[calc(100%+8px)] z-50 max-h-72 w-52 overflow-hidden rounded-2xl border border-emerald-400/40 bg-[linear-gradient(135deg,#0d1b2a,#112233)] p-3 shadow-[0_16px_48px_rgba(0,0,0,0.6)] transition-all sm:w-56 ${
          open
            ? 'opacity-100'
            : 'pointer-events-none translate-y-1 scale-[0.99] opacity-0'
        }`}
        aria-hidden={!open}
      >
        <input
          ref={searchRef}
          placeholder="Search token..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 w-full rounded-lg border border-white/15 bg-white/10 px-2.5 py-1.5 text-[12px] text-sky-100 outline-none placeholder:text-slate-500"
          tabIndex={open ? 0 : -1}
        />
        <div className="max-h-52 space-y-0.5 overflow-y-auto pr-1">
          {filtered.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                onChange(t)
                setOpen(false)
                setSearch('')
              }}
              className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-[12px] transition-colors ${
                t === value
                  ? 'bg-emerald-400/10 font-bold text-emerald-300'
                  : 'text-sky-200 hover:bg-white/10'
              }`}
              tabIndex={open ? 0 : -1}
            >
              <TokenIcon token={t} size={20} />
              <span>{t}</span>
              <span className="ml-auto text-[10px] opacity-60">
                ${(tokenPrices[t] ?? 0).toFixed(4)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
