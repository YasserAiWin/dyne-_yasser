import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { getCustomers, createCustomer } from '../../services/customersService'
import { formatCurrency } from '../../utils/format'
import { IconSearch, IconPlus, IconUser, IconPhone, IconClose } from '../../components/icons'

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'debtor', label: 'مدين' },
  { id: 'settled', label: 'مسدد' },
  { id: 'credit', label: 'له رصيد' },
]

export default function CustomersList() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [showAdd, setShowAdd] = useState(false)
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' })

  useEffect(() => {
    getCustomers().then(setCustomers)
  }, [])

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesFilter = filter === 'all' || c.status === filter
      const matchesQuery = !query || c.name.includes(query) || c.phone.includes(query)
      return matchesFilter && matchesQuery
    })
  }, [customers, query, filter])

  async function handleAdd(e) {
    e.preventDefault()
    const created = await createCustomer(newCustomer)
    setCustomers((prev) => [created, ...prev])
    setNewCustomer({ name: '', phone: '' })
    setShowAdd(false)
  }

  const columns = [
    {
      key: 'name',
      header: 'العميل',
      render: (r) => (
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-50 text-sm font-bold text-primary-700">
            {r.name.charAt(0)}
          </span>
          <span className="font-medium text-ink-900">{r.name}</span>
        </div>
      ),
    },
    { key: 'phone', header: 'رقم الهاتف', render: (r) => <span className="ltr-nums">{r.phone}</span> },
    {
      key: 'balance',
      header: 'الرصيد الحالي',
      render: (r) => {
        const color = r.balance > 0 ? 'text-red-600' : r.balance < 0 ? 'text-blue-600' : 'text-ink-500'
        return <span className={`ltr-nums font-bold ${color}`}>{formatCurrency(Math.abs(r.balance))}</span>
      },
    },
    { key: 'status', header: 'الحالة', align: 'center', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'الإجراءات',
      align: 'center',
      render: (r) => (
        <Button variant="secondary" size="sm" onClick={() => navigate(`/shop/customers/${r.id}`)}>
          عرض الملف
        </Button>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Card bodyClass="!p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input name="search" placeholder="ابحث باسم العميل أو رقم الهاتف..." value={query}
              onChange={(e) => setQuery(e.target.value)} icon={<IconSearch className="h-5 w-5" />} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === f.id ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
            <Button icon={<IconPlus className="h-4 w-4" />} onClick={() => setShowAdd(true)}>إضافة عميل</Button>
          </div>
        </div>
      </Card>

      <Card bodyClass="!p-0">
        <div className="px-2 py-2">
          <DataTable columns={columns} data={filtered} emptyText="لا يوجد عملاء مطابقون" />
        </div>
      </Card>

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
