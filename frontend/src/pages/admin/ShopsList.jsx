import { useEffect, useMemo, useState } from 'react'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import { getShops } from '../../services/shopsService'
import { formatDateShort } from '../../utils/format'
import { IconSearch, IconPlus } from '../../components/icons'
import ManageShopModal from '../../components/admin/ManageShopModal'
import CreateShopModal from '../../components/admin/CreateShopModal'
import { useLang } from '../../contexts/LanguageContext'
import strings from '../../utils/translations'

function matchesFilter(shop, filter) {
  if (filter === 'all') return true
  if (filter === 'issues') return ['EXPIRED', 'EXPIRING_SOON', 'SUSPENDED'].includes(shop.status)
  return shop.status === filter
}

export default function ShopsList() {
  const [shops, setShops] = useState([])
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [managing, setManaging] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const { lang } = useLang()
  const t = strings[lang]

  const FILTERS = [
    { id: 'all', label: t.all },
    { id: 'ACTIVE', label: t.active },
    { id: 'issues', label: t.alerts },
  ]

  function loadShops() { getShops().then(setShops) }
  useEffect(() => { loadShops() }, [])

  const filtered = useMemo(() => {
    return shops.filter((s) => {
      const matchFilter = matchesFilter(s, filter)
      const q = query.toLowerCase()
      const matchQuery = !q ||
        (s.shopName || '').toLowerCase().includes(q) ||
        (s.ownerName || '').toLowerCase().includes(q) ||
        (s.phone || '').includes(q)
      return matchFilter && matchQuery
    })
  }, [shops, query, filter])

  function handleUpdated() { loadShops(); setManaging(null) }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
            <IconSearch className="h-4 w-4" />
          </span>
          <input
            type="search"
            placeholder={t.search}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-base w-full pr-9 text-sm"
          />
        </div>

        <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-center">
          <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
            {FILTERS.map((f) => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                  filter === f.id ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500 hover:text-ink-700'
                }`}>
                {f.label}
              </button>
            ))}
          </div>
          <Button className="w-full min-[420px]:w-auto" icon={<IconPlus className="h-4 w-4" />} onClick={() => setShowCreate(true)}>
            {t.addShop}
          </Button>
        </div>
      </div>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white">
        {filtered.length === 0 ? (
          <p className="py-12 text-center text-sm text-ink-400">{t.noShops}</p>
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map((shop) => {
              const today = new Date(); today.setHours(0,0,0,0)
              const end = new Date(shop.expiryDate)
              const days = Math.round((end - today) / 86400000)
              const daysColor = days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-ink-500'
              return (
                <div key={shop.id} className="flex items-start gap-3 px-3 py-3.5 sm:items-center sm:gap-4 sm:px-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-sm font-bold text-primary-700">
                    {(shop.shopName || '?').charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink-900">{shop.shopName}</p>
                    <p className="truncate text-sm text-ink-500">
                      {shop.ownerName}
                      {shop.phone && <span className="ltr-nums mx-2 text-ink-400">· {shop.phone}</span>}
                    </p>
                    <div className="mt-2 flex items-center gap-2 sm:hidden">
                      <StatusBadge status={shop.status} />
                      <span className={`ltr-nums text-xs font-semibold ${daysColor}`}>
                        {days < 0 ? `-${Math.abs(days)}` : days}
                        <span className="mr-1 font-medium">{lang === 'en' ? 'd' : 'ي'}</span>
                      </span>
                    </div>
                  </div>
                  <div className="hidden text-end sm:block min-w-[90px]">
                    <p className={`ltr-nums text-base font-bold tabular-nums ${daysColor}`}>
                      {days < 0 ? `-${Math.abs(days)}` : days}
                      <span className="mr-1 text-xs font-medium">{lang === 'en' ? 'd' : 'ي'}</span>
                    </p>
                    <p className="ltr-nums mt-0.5 text-xs text-ink-400" style={{ direction: 'ltr' }}>
                      {formatDateShort(shop.expiryDate, lang === 'en' ? 'en-US' : 'ar-EG-u-nu-latn')}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status={shop.status} />
                  </div>
                  <Button className="shrink-0" variant="secondary" size="sm" onClick={() => setManaging(shop)}>
                    {t.edit}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {showCreate && (
        <CreateShopModal onClose={() => setShowCreate(false)} onCreated={() => { loadShops(); setShowCreate(false) }} />
      )}
      {managing && (
        <ManageShopModal shop={managing} onClose={() => setManaging(null)} onUpdated={handleUpdated} />
      )}
    </div>
  )
}
