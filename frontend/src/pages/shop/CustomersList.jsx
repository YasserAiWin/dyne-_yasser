import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import PayDebtSheet from '../../components/shop/PayDebtSheet'
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
  const [toast, setToast] = useState('')

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  const filtered = useMemo(() => {
    if (!query) return customers
    return customers.filter((c) => c.name.includes(query) || c.phone.includes(query))
  }, [customers, query])

  async function handleAdd(e) {
    e.preventDefault()
    const created = await createCustomer(newCustomer)
    setCustomers((prev) => [created, ...prev])
    setNewCustomer({ name: '', phone: '' })
    setShowAdd(false)
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
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <Input
            name="search"
            placeholder="ابحث باسم العميل أو رقم الهاتف..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<IconSearch className="h-5 w-5" />}
          />
        </div>
        <Button icon={<IconPlus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>
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
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-ink-900">{c.name}</p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                        <IconPhone className="h-4 w-4 shrink-0" />
                        <span className="ltr-nums truncate">{c.phone}</span>
                      </p>
                    </div>
                    {/* Secondary action — replaces the old status badge slot */}
                    <button
                      onClick={() => navigate(`/shop/customers/${c.id}`)}
                      className="shrink-0 rounded-lg px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-slate-50 hover:text-primary-700"
                    >
                      عرض الملف
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink-400">الرصيد الحالي</p>
                      <p className={`ltr-nums text-lg font-bold ${balanceColor}`}>
                        {formatCurrency(Math.abs(balance))}
                      </p>
                    </div>
                    {/* Primary action */}
                    <Button onClick={() => setSheetCustomer(c)}>تسديد دين</Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowAdd(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-ink-900">إضافة عميل جديد</h3>
              <button onClick={() => setShowAdd(false)} className="text-ink-400 hover:text-ink-700">
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAdd} className="space-y-4">
              <Input label="اسم العميل" value={newCustomer.name}
                onChange={(e) => setNewCustomer((c) => ({ ...c, name: e.target.value }))}
                placeholder="الاسم الكامل" icon={<IconUser className="h-5 w-5" />} required />
              <Input label="رقم الهاتف" value={newCustomer.phone}
                onChange={(e) => setNewCustomer((c) => ({ ...c, phone: e.target.value }))}
                placeholder="+222 XX XX XX XX" icon={<IconPhone className="h-5 w-5" />} required />
              <div className="flex gap-3 pt-2">
                <Button type="submit" className="flex-1">إضافة العميل</Button>
                <Button type="button" variant="secondary" onClick={() => setShowAdd(false)}>إلغاء</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
