import { useEffect, useRef, useState } from 'react'
import Button from '../Button'
import { IconClose, IconCheck, IconArrowDown, IconArrowUp } from '../icons'
import { formatCurrency } from '../../utils/format'

export default function PayDebtSheet({ open, customer, onClose, onSubmit }) {
  const [isPayment, setIsPayment] = useState(false)
  const [items, setItems] = useState([])
  const [currentInput, setCurrentInput] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const amountRef = useRef(null)

  useEffect(() => {
    if (open) {
      setIsPayment(false)
      setItems([])
      setCurrentInput('')
      setDescription('')
      setError('')
      setSaving(false)
    }
  }, [open, customer])

  if (!open || !customer) return null

  const currentBalance = customer.balance ?? 0
  const itemsTotal = items.reduce((sum, n) => sum + n, 0)
  const currentNum = Number(currentInput) || 0
  const total = itemsTotal + currentNum
  const hasAmount = total > 0
  const newBalance = isPayment ? currentBalance - total : currentBalance + total

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

  function addItem() {
    if (currentNum <= 0) return
    setItems((prev) => [...prev, currentNum])
    setCurrentInput('')
    amountRef.current?.focus()
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  function buildNote() {
    const allNums = [...items, ...(currentNum > 0 ? [currentNum] : [])]
    if (allNums.length > 1) {
      const breakdown = allNums.join(' + ') + ' = ' + total + ' MRU'
      return description ? breakdown + '\n' + description : breakdown
    }
    return description
  }

  async function handleConfirm(e) {
    e.preventDefault()
    setError('')
    if (!total || total <= 0) { setError('أدخل مبلغاً صحيحاً'); return }
    setSaving(true)
    try {
      await onSubmit({ isPayment, amount: total, item: buildNote() })
    } catch {
      setError('تعذّر تسجيل العملية. حاول مرة أخرى.')
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={saving ? undefined : onClose}
    >
      <div className="flex min-h-full items-center justify-center p-4">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-4 shadow-soft" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-ink-900">{isPayment ? 'تسديد دين' : 'تسجيل دين'}</h3>
            <p className="truncate text-xs text-ink-400">{customer.name}</p>
          </div>
          <button type="button" onClick={onClose} disabled={saving}
            className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-slate-50 hover:text-ink-700 disabled:opacity-50">
            <IconClose className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleConfirm} className="space-y-3 pb-[env(safe-area-inset-bottom)]">

          {/* Balance preview */}
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-slate-100 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
            <div className="min-w-0 p-2.5 text-center">
              <p className="mb-0.5 text-xs text-ink-400">الرصيد الحالي</p>
              <p className={`ltr-nums text-base font-bold ${balanceColor(currentBalance)}`}>
                {formatCurrency(Math.abs(currentBalance))}
              </p>
              <p className={`text-xs font-medium ${balanceColor(currentBalance)}`}>{balanceLabel(currentBalance)}</p>
            </div>
            <div className="relative min-w-0 p-2.5 text-center">
              <span className="absolute inset-y-0 -start-3 flex items-center">
                <span className={`flex h-5 w-5 items-center justify-center rounded-full ${
                  isPayment ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-500'
                }`}>
                  {isPayment ? <IconArrowDown className="h-3 w-3" /> : <IconArrowUp className="h-3 w-3" />}
                </span>
              </span>
              <p className="mb-0.5 text-xs text-ink-400">بعد العملية</p>
              {hasAmount ? (
                <>
                  <p className={`ltr-nums text-base font-bold transition-all ${balanceColor(newBalance)}`}>
                    {formatCurrency(Math.abs(newBalance))}
                  </p>
                  <p className={`text-xs font-medium ${balanceColor(newBalance)}`}>{balanceLabel(newBalance)}</p>
                </>
              ) : (
                <p className="mt-2 text-sm text-ink-300">—</p>
              )}
            </div>
          </div>

          {/* Payment toggle */}
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
            <span className="text-sm font-medium text-ink-700">هذه دفعة وليست ديناً جديداً</span>
            <input
              type="checkbox"
              checked={isPayment}
              onChange={(e) => setIsPayment(e.target.checked)}
              className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
          </label>

          {/* Amount input + plus button */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">المبلغ</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0"
                  ref={amountRef}
                  value={currentInput}
                  onChange={(e) => setCurrentInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addItem() } }}
                  className="input-base pl-14 text-base font-semibold"
                  autoFocus
                />
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-ink-400">
                  MRU
                </span>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white hover:bg-primary-700 active:scale-95"
              >
                +
              </button>
            </div>
          </div>

          {/* Items list (shown once at least one item is added) */}
          {items.length > 0 && (
            <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="space-y-1.5">
                {items.map((val, i) => (
                  <div key={i} className="flex items-center justify-between gap-2">
                    <span className="ltr-nums text-sm font-medium text-ink-700">{val} MRU</span>
                    <button
                      type="button"
                      onClick={() => removeItem(i)}
                      className="rounded p-0.5 text-ink-400 hover:text-red-500"
                    >
                      <IconClose className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                <span className="text-xs text-ink-500">المجموع</span>
                <span className="ltr-nums text-sm font-bold text-ink-900">{itemsTotal} MRU</span>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              البيان
              <span className="mr-1 text-xs font-normal text-ink-400">(اختياري)</span>
            </label>
            <input
              type="text"
              placeholder="مثال: سكر، أرز، زيت..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-base"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={saving}
            icon={saving ? null : <IconCheck className="h-5 w-5" />}>
            {saving ? 'جارٍ الحفظ...' : isPayment ? 'تأكيد الدفع' : 'تسجيل الدين'}
          </Button>
        </form>
      </div>
      </div>
    </div>
  )
}
