import { useNavigate, useLocation } from 'react-router-dom'

// Top horizontal tab navigation for the Shop Owner pages.
// Real <button> elements (not links/text). Order is fixed:
// العملاء first, لوحة التحكم second.
// Active tab = emerald text + thin emerald underline; inactive = gray.
const tabs = [
  { to: '/shop/customers', label: 'العملاء' },
  { to: '/shop/dashboard', label: 'لوحة التحكم' },
]

export default function ShopTabs() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <nav className="flex items-center gap-6 border-b border-slate-100">
      {tabs.map((tab) => {
        const isActive = pathname === tab.to
        return (
          <button
            key={tab.to}
            type="button"
            onClick={() => navigate(tab.to)}
            aria-current={isActive ? 'page' : undefined}
            className={`-mb-px border-b-2 px-1 pb-2.5 pt-1 text-sm font-semibold transition ${
              isActive
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-ink-400 hover:text-ink-700'
            }`}
          >
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
