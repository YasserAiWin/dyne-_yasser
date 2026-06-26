import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import PayDebtSheet from '../../components/shop/PayDebtSheet'
import CustomerEditSheet from '../../components/shop/CustomerEditSheet'
import { getCustomers, createCustomer } from '../../services/customersService'
import { addDebt, addPayment } from '../../services/transactionsService'
import { formatCurrency } from '../../utils/format'
import { IconSearch, IconPlus, IconUser, IconPhone, IconClose, IconCheck } from '../../components/icons'

// Derive a status key from a numeric balance.
function statusFromBalance(balance) {
  if (balance > 0) return 'debtor'
  if (balance < 0) return 'credit'
  return 'settled'
}

export default function CustomersList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' })

  // Pay/debt bottom sheet
  const [sheetCustomer, setSheetCustomer] = useState(null)
  // Edit/delete sheet
  const [editCustomer, setEditCustomer] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  const filtered = useMemo(() => {
    if (!query) return customers
    return customers.filter((c) => c.name.includes(query) || c.phone.includes(query))
  }, [customers, query])

  const [addError, setAddError] = useState('')

  async function handleAdd(e) {
    e.preventDefault()
    setAddError('')
    try {
      const created = await createCustomer(newCustomer)
      setCustomers((prev) => [{ balance: 0, ...created }, ...prev])
      setNewCustomer({ name: '', phone: '' })
      setShowAdd(false)
    } catch (err) {
      setAddError(err?.response?.data?.message || 'فشل إضافة العميل')
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  // Record a payment (decreases debt) or a new debt (increases it),
  // then update the customer's balance in the list immediately.
  async function handleSheetSubmit({ isPayment, amount, item }) {
    const id = sheetCustomer.id
    if (isPayment) {
      await addPayment(id, { amount, note: item })
    } else {
      await addDebt(id, { amount, note: item })
    }

    const delta = isPayment ? -amount : amount
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c
        const newBalance = (c.balance ?? 0) + delta
        return { ...c, balance: newBalance, status: statusFromBalance(newBalance) }
      })
    )
    setSheetCustomer(null)
    showToast(isPayment ? 'تم تسجيل الدفع بنجاح' : 'تم تسجيل الدين بنجاح')
  }

  return (
    <div className="space-y-5">
      {/* Search + add */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <Input
            name="search"
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<IconSearch className="h-5 w-5" />}
          />
        </div>
        <Button className="w-full sm:w-auto" icon={<IconPlus className="h-4 w-4" />} onClick={() => { setShowAdd(true); setAddError('') }}>
          إضافة عميل
        </Button>
      </div>

      {/* Customer cards */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <Card>
            <p className="py-6 text-center text-sm text-ink-400">لا يوجد عملاء مطابقون</p>
          </Card>
        )}

        {filtered.map((c) => {
          const balance = c.balance ?? 0
          const balanceColor = balance > 0 ? 'text-red-600' : balance < 0 ? 'text-blue-600' : 'text-ink-500'
          return (
            <Card key={c.id} bodyClass="!p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-50 text-base font-bold text-primary-700">
                  {c.name.charAt(0)}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-900">{c.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                        <IconPhone className="h-4 w-4 shrink-0" />
                        <span className="ltr-nums truncate">{c.phone}</span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1 self-start">
                      <button
                        onClick={() => setEditCustomer(c)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-slate-50 hover:text-ink-800"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => navigate(`/shop/customers/${c.id}`)}
                        className="rounded-lg px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-slate-50 hover:text-primary-700"
                      >
                        الملف
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-between">
                    <div>
                      <p className="text-xs text-ink-400">الرصيد الحالي</p>
                      <p className={`ltr-nums text-lg font-bold ${balanceColor}`}>
                        {formatCurrency(Math.abs(balance))}
                      </p>
                    </div>
                    {/* Primary action */}
                    <Button className="w-full min-[420px]:w-auto" onClick={() => setSheetCustomer(c)}>تسجيل دين</Button>
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Pay/debt bottom sheet */}
      <PayDebtSheet
        open={Boolean(sheetCustomer)}
        customer={sheetCustomer}
        onClose={() => setSheetCustomer(null)}
        onSubmit={handleSheetSubmit}
      />

      {/* Edit/delete sheet */}
      <CustomerEditSheet
        open={Boolean(editCustomer)}
        customer={editCustomer}
        onClose={() => setEditCustomer(null)}
        onUpdated={(updated) => {
          setCustomers((prev) => prev.map((c) => c.id === updated?.id ? { ...c, ...updated } : c))
          setEditCustomer(null)
          showToast('تم تحديث بيانات العميل')
        }}
        onDeleted={(id) => {
          setCustomers((prev) => prev.filter((c) => c.id !== id))
          setEditCustomer(null)
          showToast('تم حذف العميل')
        }}
      />

      {/* Success toast */}
      {toast && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
          <div className="flex items-center gap-2 rounded-xl bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-soft">
            <IconCheck className="h-4 w-4 text-primary-400" />
            {toast}
          </div>
        </div>
      )}

      {/* Add customer modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4" onClick={() => setShowAdd(false)}>
          <div className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl bg-white p-4 shadow-soft sm:max-h-[calc(100dvh-2rem)] sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="min-w-0 text-lg font-bold text-ink-900">إضافة عميل جديد</h3>
              <button onClick={() => setShowAdd(false)} className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-slate-50 hover:text-ink-700">
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4 pb-[env(safe-area-inset-bottom)]">
              <Input label="اسم العميل" value={newCustomer.name}
                onChange={(e) => setNewCustomer((c) => ({ ...c, name: e.target.value }))}
                placeholder="الاسم الكامل" icon={<IconUser className="h-5 w-5" />} required />
              <Input label="رقم الهاتف" value={newCustomer.phone}
                onChange={(e) => setNewCustomer((c) => ({ ...c, phone: e.target.value }))}
                placeholder="XX XX XX XX" icon={<IconPhone className="h-5 w-5" />} />
              {addError && (
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{addError}</div>
              )}
              <div className="grid grid-cols-1 gap-3 pt-2 min-[360px]:grid-cols-2">
                <Button type="submit">إضافة العميل</Button>
                <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
