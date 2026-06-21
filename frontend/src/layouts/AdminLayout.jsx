import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { logout, getCurrentUser } from '../services/authService'
import { IconDashboard, IconShop } from '../components/icons'
import { useLang } from '../contexts/LanguageContext'
import strings from '../utils/translations'

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()
  const { lang, toggleLang, isEn } = useLang()
  const t = strings[lang]

  const navItems = [
    { to: '/admin/dashboard', label: t.dashboard, icon: IconDashboard, end: true },
    { to: '/admin/shops', label: t.shops, icon: IconShop, end: true },
  ]

  const titles = {
    '/admin/dashboard': [t.pageDashboard, t.pageDashboardSub],
    '/admin/shops': [t.pageShops, t.pageShopsSub],
  }

  const [title, subtitle] = titles[pathname] || [t.appSub, '']

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  return (
    <div
      className="flex min-h-screen bg-slate-50"
      dir={isEn ? 'ltr' : 'rtl'}
      style={isEn ? { fontFamily: 'system-ui, -apple-system, sans-serif' } : {}}
    >
      <Sidebar
        items={navItems}
        title={t.appName}
        subtitle={t.appSub}
        open={open}
        onClose={() => setOpen(false)}
        onLogout={handleLogout}
        logoutLabel={t.logout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          onMenu={() => setOpen(true)}
          userName={user?.name || t.appSub}
          extra={
            <button
              onClick={toggleLang}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-ink-600 transition hover:bg-slate-50"
              title={isEn ? 'Switch to Arabic' : 'Switch to English'}
            >
              {isEn ? 'AR' : 'EN'}
            </button>
          }
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
