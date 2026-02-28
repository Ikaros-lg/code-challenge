export type ToastType = 'success' | 'error';

export type ToastItem = {
  id: number;
  type: ToastType;
  from?: string;
  to?: string;
  fromAmount?: string;
  toAmount?: string;
  rate?: string;
  txn?: string;
  time?: string;
  message?: string;
};

export type ToastProps = {
  toasts: ToastItem[];
};

export function Toast({ toasts }: ToastProps) {
  return (
    <div className="pointer-events-none fixed right-6 top-6 z-[9999] flex flex-col gap-3">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto min-w-[300px] max-w-[400px] rounded-2xl border bg-gradient-to-br px-5 py-4 text-sky-100 shadow-2xl ${
            t.type === 'success'
              ? 'from-slate-900 via-slate-800 to-slate-700 border-emerald-400'
              : 'from-red-950 via-amber-950 to-slate-900 border-red-500'
          }`}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            <span
              className={`text-sm font-bold ${
                t.type === 'success' ? 'text-emerald-300' : 'text-red-400'
              }`}
            >
              {t.type === 'success' ? 'SWAP CONFIRMED' : 'SWAP FAILED'}
            </span>
          </div>
          {t.type === 'success' &&
            t.from &&
            t.to &&
            t.fromAmount &&
            t.toAmount &&
            t.rate &&
            t.txn &&
            t.time && (
              <div className="text-xs leading-relaxed text-sky-200">
                <div>
                  📤 Sent:{' '}
                  <span className="text-white">
                    {t.fromAmount} {t.from}
                  </span>
                </div>
                <div>
                  📥 Received:{' '}
                  <span className="text-emerald-300">
                    {t.toAmount} {t.to}
                  </span>
                </div>
                <div>
                  💱 Rate:{' '}
                  <span className="text-white">
                    1 {t.from} = {t.rate} {t.to}
                  </span>
                </div>
                <div className="mt-1.5 text-[10px] text-slate-600">
                  TXN #{t.txn} · {t.time}
                </div>
              </div>
            )}
          {t.type === 'error' && t.message && (
            <div className="text-xs text-red-200">{t.message}</div>
          )}
        </div>
      ))}
    </div>
  )
}
