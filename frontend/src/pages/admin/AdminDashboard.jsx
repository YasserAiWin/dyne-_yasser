import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import Card from '../../components/Card'
import DataTable from '../../components/DataTable'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import { getShops, getAdminStats } from '../../services/shopsService'
import { formatDate, daysRemaining } from '../../utils/format'
import { IconShop, IconCheck, IconClock, IconWarning, IconArrowUp } from '../../components/icons'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [shops, setShops] = useState([])

  useEffect(() => {
    getAdminStats().then(setStats)
    getShops().then(setShops)
  }, [])

  const recentShops = shops.slice(0, 5)
  const expiringShops = shops.filter((s) => s.status === 'expiring' || s.status === 'expired')

  const recentColumns = [
    { key: 'name', header: 'اسم المتجر', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'ownerName', header: 'صاحب المتجر' },
    { key: 'endDate', header: 'تاريخ الانتهاء', render: (r) => <span className="ltr-nums">{formatDate(r.endDate)}</span> },
    { key: 'status', header: 'الحالة', align: 'center', render: (r) => <StatusBadge status={r.status} /> },
  ]

  const expiringColumns = [
    { key: 'name', header: 'اسم المتجر', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    {
      key: 'days',
      header: 'الأيام المتبقية',
      align: 'center',
      render: (r) => {
        const d = daysRemaining(r.endDate)
        return (
          <span className={`ltr-nums font-medium ${d < 0 ? 'text-red-600' : 'text-orange-600'}`}>
            {d < 0 ? `متأخر ${Math.abs(d)} يوم` : `${d} يوم`}
          </span>
        )
      },
    },
    { key: 'status', header: 'الحالة', align: 'center', render: (r) => <StatusBadge status={r.status} /> },
  ]

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="إجمالي المتاجر" value={stats?.totalShops ?? '—'} icon={<IconShop className="h-5 w-5" />} tone="primary" />
        <StatCard label="المتاجر النشطة" value={stats?.activeShops ?? '—'} icon={<IconCheck className="h-5 w-5" />} tone="primary" />
        <StatCard label="تنتهي قريبًا" value={stats?.expiringShops ?? '—'} icon={<IconClock className="h-5 w-5" />} tone="orange" />
        <StatCard label="المتاجر المنتهية" value={stats?.expiredShops ?? '—'} icon={<IconWarning className="h-5 w-5" />} tone="red" />
        <StatCard label="التجديدات هذا الشهر" value={stats?.renewalsThisMonth ?? '—'} icon={<IconArrowUp className="h-5 w-5" />} tone="blue" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent shops */}
        <Card
          className="lg:col-span-2"
          title="أحدث المتاجر"
          action={
            <Link to="/admin/shops">
              <Button variant="ghost" size="sm">عرض الكل</Button>
            </Link>
          }
          bodyClass="!p-0"
        >
          <div className="px-2 py-1">
            <DataTable columns={recentColumns} data={recentShops} />
          </div>
        </Card>

        {/* Subscription overview */}
        <Card title="نظرة عامة على الاشتراكات">
          <div className="space-y-5">
            <OverviewRow label="نشطة" value={stats?.activeShops ?? 0} total={stats?.totalShops ?? 1} color="bg-primary-500" />
            <OverviewRow label="تنتهي قريبًا" value={stats?.expiringShops ?? 0} total={stats?.totalShops ?? 1} color="bg-orange-400" />
            <OverviewRow label="منتهية" value={stats?.expiredShops ?? 0} total={stats?.totalShops ?? 1} color="bg-red-500" />

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-ink-500">معدل التجديد</p>
              <p className="mt-1 text-2xl font-bold text-primary-700">
                <span className="ltr-nums">86%</span>
              </p>
              <p className="mt-1 text-xs text-ink-400">مقارنة بالشهر الماضي +4%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Expiring shops */}
      <Card
        title="متاجر تحتاج إلى تجديد"
        action={
          <Link to="/admin/subscriptions">
            <Button variant="secondary" size="sm">إدارة الاشتراكات</Button>
          </Link>
        }
        bodyClass="!p-0"
      >
        <div className="px-2 py-1">
          <DataTable columns={expiringColumns} data={expiringShops} emptyText="لا توجد متاجر تحتاج للتجديد" />
        </div>
      </Card>
    </div>
  )
}

function OverviewRow({ label, value, total, color }) {
  const pct = total ? Math.round((value / total) * 100) : 0
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-sm">
        <span className="text-ink-700">{label}</span>
        <span className="ltr-nums font-medium text-ink-900">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
