import { useEffect, useMemo, useState } from 'react'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import StatusBadge from '../../components/StatusBadge'
import { getShops, extendSubscription } from '../../services/shopsService'
import { formatDate, daysRemaining, addToDate } from '../../utils/format'
import { IconClock, IconCheck, IconSearch } from '../../components/icons'

const FILTERS = [
  { id: 'all', label: 'الكل' },
  { id: 'expiring', label: 'قرب الانتهاء' },
  { id: 'expired', label: 'منتهي' },
]

export default function SubscriptionManagement() {
  const [shops, setShops] = useState([])
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  // Extension inputs
  const [days, setDays] = useState(0)
  const [months, setMonths] = useState(0)
  const [years, setYears] = useState(0)
  const [customDate, setCustomDate] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getShops().then((data) => {
      const needRenewal = data.filter((s) => s.status === 'expiring' || s.status === 'expired')
      setShops(needRenewal)
      if (needRenewal.length) setSelected(needRenewal[0])
    })
  }, [])

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchesFilter = filter === 'all' || s.status === filter
      const matchesQuery = !query || s.name.includes(query) || s.ownerName.includes(query)
      return matchesFilter && matchesQuery
    })
  }, [shops, filter, query])

  // New end date = (custom date) OR (current end + days/months/years).
  const newEndDate = useMemo(() => {
    if (!selected) return ''
    if (customDate) return customDate
    return addToDate(selected.endDate, {
      days: Number(days) || 0,
      months: Number(months) || 0,
      years: Number(years) || 0,
    })
  }, [selected, days, months, years, customDate])

  function pickShop(shop) {
    setSelected(shop)
    setDays(0); setMonths(0); setYears(0); setCustomDate(''); setSaved(false)
  }

  async function handleSave() {
    if (!selected) return
    await extendSubscription(selected.id, { newEndDate })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* Shops needing renewal */}
      <div className="space-y-4 lg:col-span-3">
        <Card bodyClass="!p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="w-full sm:max-w-xs">
              <Input name="search" placeholder="ابحث عن متجر..." value={query}
                onChange={(e) => setQuery(e.target.value)} icon={<IconSearch className="h-5 w-5" />} />
            </div>
            <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              {FILTERS.map((f) => (
                <button key={f.id} onClick={() => setFilter(f.id)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                    filter === f.id ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500'
                  }`}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          {filtered.length === 0 && (
            <Card><p className="py-6 text-center text-sm text-ink-400">لا توجد متاجر مطابقة</p></Card>
          )}
          {filtered.map((shop) => {
            const d = daysRemaining(shop.endDate)
            const active = selected?.id === shop.id
            return (
              <button
                key={shop.id}
                onClick={() => pickShop(shop)}
                className={`w-full rounded-2xl border bg-white p-4 text-right transition ${
                  active ? 'border-primary-300 ring-2 ring-primary-100' : 'border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink-900">{shop.name}</p>
                    <p className="mt-0.5 text-sm text-ink-500">{shop.ownerName}</p>
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
                      <IconClock className="h-4 w-4" />
                      ينتهي في <span className="ltr-nums">{formatDate(shop.endDate)}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusBadge status={shop.status} />
                    <span className={`ltr-nums text-xs font-medium ${d < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {d < 0 ? `متأخر ${Math.abs(d)} يوم` : `${d} يوم متبقٍ`}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Extension panel */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-24">
          <Card title="تمديد الاشتراك">
            {!selected ? (
              <p className="py-8 text-center text-sm text-ink-400">اختر متجرًا لتمديد اشتراكه</p>
            ) : (
              <div className="space-y-5">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-sm font-semibold text-ink-900">{selected.name}</p>
                  <p className="text-xs text-ink-500">{selected.ownerName}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Input label="إضافة أيام" type="number" min="0" value={days}
                    onChange={(e) => { setDays(e.target.value); setCustomDate('') }} />
                  <Input label="إضافة أشهر" type="number" min="0" value={months}
                    onChange={(e) => { setMonths(e.target.value); setCustomDate('') }} />
                  <Input label="إضافة سنوات" type="number" min="0" value={years}
                    onChange={(e) => { setYears(e.target.value); setCustomDate('') }} />
                </div>

                <Input label="أو تاريخ مخصص" type="date" value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)} hint="يتجاوز القيم أعلاه" />

                <div className="space-y-2 rounded-xl border border-slate-100 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">تاريخ الانتهاء الحالي</span>
                    <span className="ltr-nums font-medium text-ink-700">{formatDate(selected.endDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-ink-500">تاريخ الانتهاء الجديد</span>
                    <span className="ltr-nums font-bold text-primary-700">{formatDate(newEndDate)}</span>
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={handleSave}
                  icon={saved ? <IconCheck className="h-5 w-5" /> : null}>
                  {saved ? 'تم حفظ التمديد' : 'حفظ التمديد'}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
