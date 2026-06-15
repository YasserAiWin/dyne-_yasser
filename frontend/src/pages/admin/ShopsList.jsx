import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/Card'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { getShops } from '../../services/shopsService'
import { formatDate, daysRemaining } from '../../utils/format'
import { IconSearch, IconPlus } from '../../components/icons'

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'active', label: 'نشط' },
  { id: 'expiring', label: 'قرب الانتهاء' },
  { id: 'expired', label: 'منتهي' },
]

export default function ShopsList() {
  const [shops, setShops] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getShops().then(setShops)
  }, [])

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchesFilter = filter === 'all' || s.status === filter
      const matchesQuery =
        !query ||
        s.name.includes(query) ||
        s.ownerName.includes(query) ||
        s.phone.includes(query)
      return matchesFilter && matchesQuery
    })
  }, [shops, query, filter])

  const columns = [
    { key: 'name', header: 'اسم المتجر', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'ownerName', header: 'صاحب المتجر' },
    { key: 'startDate', header: 'تاريخ البداية', render: (r) => <span className="ltr-nums">{formatDate(r.startDate)}</span> },
    { key: 'endDate', header: 'تاريخ الانتهاء', render: (r) => <span className="ltr-nums">{formatDate(r.endDate)}</span> },
    {
      key: 'days',
      header: 'الأيام المتبقية',
      align: 'center',
      render: (r) => {
        const d = daysRemaining(r.endDate)
        const color = d < 0 ? 'text-red-600' : d <= 30 ? 'text-orange-600' : 'text-ink-700'
        return <span className={`ltr-nums font-medium ${color}`}>{d < 0 ? `متأخر ${Math.abs(d)}` : d}</span>
      },
    },
    { key: 'status', header: 'الحالة', align: 'center', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions',
      header: 'الإجراءات',
      align: 'center',
      render: (r) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="secondary" size="sm">تعديل</Button>
          <Link to="/admin/subscriptions">
            <Button variant="primary" size="sm">تمديد الاشتراك</Button>
          </Link>
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-5">
      <Card bodyClass="!p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="w-full lg:max-w-sm">
            <Input
              name="search"
              placeholder="ابحث باسم المتجر أو المالك أو الهاتف..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              icon={<IconSearch className="h-5 w-5" />}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1 rounded-xl bg-slate-100 p-1">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === f.id ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <Link to="/admin/shops/create">
              <Button icon={<IconPlus className="h-4 w-4" />}>إضافة متجر</Button>
            </Link>
          </div>
        </div>
      </Card>

      <Card bodyClass="!p-0">
        <div className="px-2 py-2">
          <DataTable columns={columns} data={filtered} emptyText="لا توجد متاجر مطابقة" />
        </div>
      </Card>
    </div>
  )
}
