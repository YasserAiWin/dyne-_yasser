import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import StatCard from '../../components/StatCard'
import Card from '../../components/Card'
import StatusBadge from '../../components/StatusBadge'
import Button from '../../components/Button'
import { getShopStats, getCustomers } from '../../services/customersService'
import { getRecentTransactions } from '../../services/transactionsService'
import { formatCurrency, formatDate } from '../../utils/format'
import { IconUsers, IconMoney, IconArrowUp, IconArrowDown, IconCheck } from '../../components/icons'

export default function ShopDashboard() {
  const [stats, setStats] = useState(null)
  const [customers, setCustomers] = useState([])
  const [recent, setRecent] = useState([])

  useEffect(() => {
    getShopStats().then(setStats)
    getCustomers().then(setCustomers)
    getRecentTransactions().then(setRecent)
  }, [])

  const topDebtors = [...customers]
    .filter((c) => c.balance > 0)
    .sort((a, b) => b.balance - a.balance)
    .slice(0, 5)

  const maxDebt = topDebtors[0]?.balance || 1

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="إجمالي العملاء" value={stats?.totalCustomers ?? '—'} icon={<IconUsers className="h-5 w-5" />} tone="primary" />
        <StatCard label="إجمالي الدين المستحق" value={stats ? formatCurrency(stats.totalDebt) : '—'} icon={<IconMoney className="h-5 w-5" />} tone="red" />
        <StatCard label="عملاء لديهم دين" value={stats?.debtorsCount ?? '—'} icon={<IconArrowUp className="h-5 w-5" />} tone="orange" />
        <StatCard label="عملاء لديهم رصيد" value={stats?.creditorsCount ?? '—'} icon={<IconArrowDown className="h-5 w-5" />} tone="blue" />
        <StatCard label="مدفوعات اليوم" value={stats ? formatCurrency(stats.todayPayments) : '—'} icon={<IconCheck className="h-5 w-5" />} tone="primary" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent transactions */}
        <Card
          className="lg:col-span-2"
          title="أحدث المعاملات"
          action={
            <Link to="/shop/customers">
              <Button variant="ghost" size="sm">العملاء</Button>
            </Link>
          }
        >
          <div className="divide-y divide-slate-50">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full ${
                    t.type === 'debt' ? 'bg-red-50 text-red-600' : 'bg-primary-50 text-primary-600'
                  }`}>
                    {t.type === 'debt' ? <IconArrowUp className="h-4 w-4" /> : <IconArrowDown className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{t.customer}</p>
                    <p className="text-xs text-ink-400">
                      <span className="ltr-nums">{formatDate(t.date)}</span>
                    </p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-sm font-bold ${t.type === 'debt' ? 'text-red-600' : 'text-primary-700'}`}>
                    {t.type === 'debt' ? '+' : '−'} {formatCurrency(t.amount)}
                  </p>
                  <StatusBadge status={t.type} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top debtors / balance summary */}
        <Card title="أعلى الأرصدة المدينة">
          <div className="space-y-4">
            {topDebtors.map((c) => (
              <div key={c.id}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink-700">{c.name}</span>
                  <span className="ltr-nums font-bold text-red-600">{formatCurrency(c.balance)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-red-400" style={{ width: `${(c.balance / maxDebt) * 100}%` }} />
                </div>
              </div>
            ))}

            <div className="mt-4 rounded-xl bg-primary-50 p-4">
              <p className="text-sm text-primary-700">إجمالي الديون المستحقة</p>
              <p className="mt-1 text-2xl font-bold text-primary-800">
                <span className="ltr-nums">{stats ? formatCurrency(stats.totalDebt) : '—'}</span>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
