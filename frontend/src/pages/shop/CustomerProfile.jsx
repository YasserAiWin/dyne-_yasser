import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import StatusBadge from '../../components/StatusBadge'
import DataTable from '../../components/DataTable'
import { getCustomer } from '../../services/customersService'
import { getCustomerTransactions, addDebt, addPayment } from '../../services/transactionsService'
import { formatCurrency, formatDate } from '../../utils/format'
import { IconPhone, IconArrowUp, IconArrowDown, IconUser } from '../../components/icons'

// Derive a status key from a numeric balance.
function statusFromBalance(balance) {
  if (balance > 0) return 'debtor'
  if (balance < 0) return 'credit'
  return 'settled'
}

export default function CustomerProfile() {
  const { id } = useParams()
  const [customer, setCustomer] = useState(null)
  const [txns, setTxns] = useState([])
  const [debtForm, setDebtForm] = useState({ amount: '', note: '' })
  const [payForm, setPayForm] = useState({ amount: '', note: '' })

  useEffect(() => {
    getCustomer(id).then(setCustomer)
    getCustomerTransactions(id).then((data) =>
      // newest first for display
      setTxns([...data].reverse())
    )
  }, [id])

  // Live balance derives from the initial customer balance + nothing (txns already reflect it).
  const balance = customer?.balance ?? 0
  const status = statusFromBalance(balance)

  async function submitTxn(type, form, reset) {
    const amount = Number(form.amount)
    if (!amount || amount <= 0) return

    const submit = type === 'debt' ? addDebt : addPayment
    const created = await submit(id, { amount, note: form.note })
    const delta = type === 'debt' ? amount : -amount
    const newBalance = balance + delta

    setCustomer((c) => ({ ...c, balance: newBalance, status: statusFromBalance(newBalance) }))
    setTxns((prev) => [{ ...created, balanceAfter: newBalance }, ...prev])
    reset({ amount: '', note: '' })
  }

  const columns = useMemo(
    () => [
      {
        key: 'type',
        header: 'النوع',
        render: (r) => (
          <span className={`inline-flex items-center gap-1.5 text-sm font-medium ${
            r.type === 'debt' ? 'text-red-600' : 'text-primary-700'
          }`}>
            {r.type === 'debt' ? <IconArrowUp className="h-4 w-4" /> : <IconArrowDown className="h-4 w-4" />}
            {r.type === 'debt' ? 'دين' : 'دفعة'}
          </span>
        ),
      },
      {
        key: 'amount',
        header: 'المبلغ',
        render: (r) => (
          <span className={`ltr-nums font-bold ${r.type === 'debt' ? 'text-red-600' : 'text-primary-700'}`}>
            {r.type === 'debt' ? '+' : '−'} {formatCurrency(r.amount)}
          </span>
        ),
      },
      { key: 'note', header: 'البيان', render: (r) => r.note || '—' },
      { key: 'date', header: 'التاريخ', render: (r) => <span className="ltr-nums">{formatDate(r.date)}</span> },
      {
        key: 'balanceAfter',
        header: 'الرصيد بعد العملية',
        align: 'center',
        render: (r) => <span className="ltr-nums font-medium text-ink-900">{formatCurrency(r.balanceAfter)}</span>,
      },
    ],
    []
  )

  if (!customer) {
    return <p className="py-12 text-center text-sm text-ink-400">جارٍ تحميل بيانات العميل...</p>
  }

  return (
    <div className="space-y-6">
      <Link to="/shop/customers" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700">
        ← العودة إلى العملاء
      </Link>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Customer summary + forms */}
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <div className="flex items-center gap-4">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-xl font-bold text-primary-700">
                {customer.name.charAt(0)}
              </span>
              <div>
                <h2 className="text-lg font-bold text-ink-900">{customer.name}</h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-ink-500">
                  <IconPhone className="h-4 w-4" />
                  <span className="ltr-nums">{customer.phone}</span>
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-ink-500">الرصيد الحالي</p>
              <p className={`mt-1 text-2xl font-bold ${
                balance > 0 ? 'text-red-600' : balance < 0 ? 'text-blue-600' : 'text-ink-700'
              }`}>
                <span className="ltr-nums">{formatCurrency(Math.abs(balance))}</span>
              </p>
              <div className="mt-2 flex justify-center">
                <StatusBadge status={status} />
              </div>
            </div>
          </Card>

          {/* Add debt */}
          <Card title="إضافة دين">
            <form onSubmit={(e) => { e.preventDefault(); submitTxn('debt', debtForm, setDebtForm) }} className="space-y-3">
              <Input label="المبلغ" type="number" min="1" placeholder="0" value={debtForm.amount}
                onChange={(e) => setDebtForm((f) => ({ ...f, amount: e.target.value }))} required />
              <Input label="البيان (اختياري)" placeholder="وصف الدين" value={debtForm.note}
                onChange={(e) => setDebtForm((f) => ({ ...f, note: e.target.value }))} />
              <Button type="submit" variant="danger" className="w-full" icon={<IconArrowUp className="h-4 w-4" />}>
                تسجيل الدين
              </Button>
            </form>
          </Card>

          {/* Add payment */}
          <Card title="إضافة دفعة">
            <form onSubmit={(e) => { e.preventDefault(); submitTxn('payment', payForm, setPayForm) }} className="space-y-3">
              <Input label="المبلغ" type="number" min="1" placeholder="0" value={payForm.amount}
                onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} required />
              <Input label="البيان (اختياري)" placeholder="وصف الدفعة" value={payForm.note}
                onChange={(e) => setPayForm((f) => ({ ...f, note: e.target.value }))} />
              <Button type="submit" className="w-full" icon={<IconArrowDown className="h-4 w-4" />}>
                تسجيل الدفعة
              </Button>
            </form>
          </Card>
        </div>

        {/* Transaction history */}
        <div className="lg:col-span-2">
          <Card title="سجل المعاملات" bodyClass="!p-0">
            <div className="px-2 py-2">
              <DataTable columns={columns} data={txns} emptyText="لا توجد معاملات بعد" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
