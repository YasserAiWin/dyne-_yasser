import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getShopStats } from '../../services/customersService'
import { formatCurrency } from '../../utils/format'
import { IconUsers, IconMoney } from '../../components/icons'

export default function ShopDashboard() {
  const [stats, setStats] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    getShopStats().then(setStats)
  }, [])

  const totalDebt = stats ? formatCurrency(stats.totalDebt) : '—'
  const debtors = stats?.debtorsCount ?? '—'

  return (
    <div className="space-y-4">
      {/* Two key numbers */}
      <div className="grid grid-cols-2 gap-4">
        {/* Total debt */}
        <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-100 p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <IconMoney className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-ink-400">إجمالي الديون المستحقة</p>
            <p className="ltr-nums mt-1 text-2xl font-bold text-red-600">{totalDebt}</p>
          </div>
        </div>

        {/* Debtors count */}
        <div className="flex flex-col justify-between rounded-2xl bg-white border border-slate-100 p-5 shadow-card">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <IconUsers className="h-5 w-5" />
          </div>
          <div className="mt-4">
            <p className="text-xs text-ink-400">عملاء عليهم دين</p>
            <p className="ltr-nums mt-1 text-2xl font-bold text-ink-900">{debtors}</p>
          </div>
        </div>
      </div>

      {/* Quick action */}
      <button
        onClick={() => navigate('/shop/customers')}
        className="w-full rounded-2xl border border-primary-100 bg-primary-50 py-4 text-center text-sm font-semibold text-primary-700 transition hover:bg-primary-100"
      >
        عرض جميع العملاء ←
      </button>
    </div>
  )
}
