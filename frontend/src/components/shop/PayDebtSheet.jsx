import { useEffect, useState } from 'react'
import Button from '../Button'
import { IconClose, IconCheck, IconArrowDown, IconArrowUp } from '../icons'
import { formatCurrency } from '../../utils/format'

export default function PayDebtSheet({ open, customer, onClose, onSubmit }) {
  const [isPayment, setIsPayment] = useState(false) // default: debt recording
  const [amount, setAmount] = useState('')
  const [item, setItem] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      setIsPayment(false)
      setAmount('')
      setItem('')
      setError('')
      setSaving(false)
    }
  }, [open, customer])

  if (!open || !customer) return null

  const currentBalance = customer.balance ?? 0
  const entered = Number(amount) || 0
  const newBalance = isPayment ? currentBalance - entered : currentBalance + entered
  const hasAmount = entered > 0

  function balanceColor(bal) {
    if (bal > 0) return 'text-red-600'
    if (bal < 0) return 'text-blue-600'
    return 'text-emerald-600'
  }

  function balanceLabel(bal) {
    if (bal > 0) return 'دين'
    if (bal < 0) return 'رصيد زائد'
    return 'مسدَّد'
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')
    if (!entered || entered <= 0) { setError('أدخل مبلغاً صحيحاً'); return }

    setSaving(true)
    try {
      await onSubmit({ isPayment, amount: entered, item: item.trim() })
    } catch {
      setError('تعذّر تسجيل العملية. حاول مرة أخرى.')
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={saving ? undefined : onClose} aria-hidden />

      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl bg-white p-4 shadow-soft sm:max-h-[calc(100dvh-2rem)] sm:p-5">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-ink-900">{isPayment ? 'تسديد دين' : 'تسجيل دين'}</h3>
            <p className="truncate text-sm text-ink-400">{customer.name}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving}
            className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-slate-50 hover:text-ink-700 disabled:opacity-50">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4 pb-[env(safe-area-inset-bottom)]">

          {/* Live balance preview — the main feature */}
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
            {/* Current */}
            <div className="min-w-0 p-3 text-center sm:p-4">
              <p className="mb-1 text-xs text-ink-400">الرصيد الحالي</p>
              <p className={`ltr-nums text-lg font-bold ${balanceColor(currentBalance)}`}>
                {formatCurrency(Math.abs(currentBalance))}
              </p>
              <p className={`text-xs font-medium ${balanceColor(currentBalance)}`}>
                {balanceLabel(currentBalance)}
              </p>
            </div>

            {/* Arrow + new balance */}
            <div className="relative min-w-0 p-3 text-center sm:p-4">
              {/* Arrow in the divider */}
              <span className="absolute inset-y-0 -start-3 flex items-center">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  isPayment ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                }`}>
                  {isPayment
                    ? <IconArrowDown className="h-3.5 w-3.5" />
                    : <IconArrowUp className="h-3.5 w-3.5" />
                  }
                </span>
              </span>
              <p className="mb-1 text-xs text-ink-400">بعد العملية</p>
              {hasAmount ? (
                <>
                  <p className={`ltr-nums text-lg font-bold transition-all ${balanceColor(newBalance)}`}>
                    {formatCurrency(Math.abs(newBalance))}
                  </p>
                  <p className={`text-xs font-medium ${balanceColor(newBalance)}`}>
                    {balanceLabel(newBalance)}
                  </p>
                </>
              ) : (
                <p className="mt-1 text-sm text-ink-300">—</p>
              )}
            </div>
          </div>

          {/* Payment toggle */}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3 sm:px-4">
            <span className="min-w-0 text-sm font-medium leading-6 text-ink-700">هذه دفعة وليست دينًا جديدًا</span>
            <input
              type="checkbox"
              checked={isPayment}
              onChange={(e) => setIsPayment(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">المبلغ</label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="input-base pl-16 text-lg font-semibold"
                autoFocus
              />
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-ink-400">
                MRU
              </span>
            </div>
          </div>

          {/* Item name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              السلعة
              <span className="mr-1 text-xs font-normal text-ink-400">(اختياري)</span>
            </label>
            <input
              type="text"
              placeholder="مثال: سكر، أرز، زيت..."
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="input-base"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={saving}
            icon={saving ? null : <IconCheck className="h-5 w-5" />}>
            {saving ? 'جارٍ الحفظ...' : isPayment ? 'تأكيد الدفع' : 'تسجيل الدين'}
          </Button>
        </form>
      </div>
    </div>
  )
}
