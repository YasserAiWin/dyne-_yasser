import { useEffect, useState } from 'react'
import Button from '../Button'
import { IconClose, IconCheck } from '../icons'

// Bottom-sheet for recording a payment (default) or a new debt.
// Shop-owner side ONLY — not shared with the admin/manager side.
//
// props:
//   open        boolean
//   customer    { id, name, ... } | null
//   onClose()   close without saving
//   onSubmit({ isPayment, amount, item }) -> Promise  (caller persists + updates list)
export default function PayDebtSheet({ open, customer, onClose, onSubmit }) {
  const [isPayment, setIsPayment] = useState(true) // default: تسديد (payment)
  const [amount, setAmount] = useState('')
  const [item, setItem] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  // Reset the form each time the sheet opens for a customer.
  useEffect(() => {
    if (open) {
      setIsPayment(true)
      setAmount('')
      setItem('')
      setError('')
      setSaving(false)
    }
  }, [open, customer])

  if (!open || !customer) return null

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')

    if (amount === '' || amount === null) {
      setError('أدخل المبلغ')
      return
    }
    const value = Number(amount)
    if (!Number.isFinite(value) || value <= 0) {
      setError('المبلغ غير صحيح')
      return
    }
    if (!customer?.name) {
      setError('اسم العميل غير موجود')
      return
    }

    setSaving(true)
    try {
      await onSubmit({ isPayment, amount: value, item: item.trim() })
    } catch (err) {
      setError('تعذّر تسجيل العملية. حاول مرة أخرى.')
      setSaving(false)
    }
  }

  const confirmLabel = isPayment ? 'تأكيد الدفع' : 'تسجيل الدين'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={saving ? undefined : onClose} aria-hidden />

      {/* Sheet */}
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-5 shadow-soft sm:rounded-3xl">
        {/* Grab handle (mobile affordance) */}
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-ink-900">تسديد دين</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="text-ink-400 hover:text-ink-700 disabled:opacity-50"
            aria-label="إغلاق"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-4">
          {/* Payment vs new-debt toggle */}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-ink-700">هذه دفعة وليست دينًا جديدًا</span>
            <input
              type="checkbox"
              checked={isPayment}
              onChange={(e) => setIsPayment(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          {/* Customer name (read-only, prefilled) */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">اسم العميل</label>
            <input
              type="text"
              value={customer.name}
              readOnly
              className="input-base bg-slate-50 text-ink-700"
            />
          </div>

          {/* Amount with MRU suffix */}
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
                className="input-base pl-16"
                autoFocus
              />
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-ink-400">
                MRU
              </span>
            </div>
          </div>

          {/* Item name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">اسم السلعة (اختياري)</label>
            <input
              type="text"
              placeholder="مثال: سكر، أرز، زيت..."
              value={item}
              onChange={(e) => setItem(e.target.value)}
              className="input-base"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={saving}
            icon={saving ? null : <IconCheck className="h-5 w-5" />}
          >
            {saving ? 'جارٍ الحفظ...' : confirmLabel}
          </Button>
        </form>
      </div>
    </div>
  )
}
