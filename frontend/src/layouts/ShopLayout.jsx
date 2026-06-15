import { useState } from 'react'
import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { logout, getCurrentUser } from '../services/authService'
import { IconDashboard, IconUsers } from '../components/icons'

const navItems = [
  { to: '/shop/dashboard', label: 'لوحة التحكم', icon: IconDashboard, end: true },
  { to: '/shop/customers', label: 'العملاء', icon: IconUsers, end: true },
]

// Shop-owner side is kept intentionally simple: no descriptive subtitles
// on the main tabs (per the approved mobile-first design).
const titles = {
  '/shop/dashboard': ['لوحة التحكم', ''],
  '/shop/customers': ['العملاء', ''],
}

export default function ShopLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()

  let [title, subtitle] = titles[pathname] || ['متجري', '']
  if (matchPath('/shop/customers/:id', pathname)) {
    title = 'ملف العميل'
    subtitle = 'تفاصيل الحساب والمعاملات'
  }

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        items={navItems}
        title="متجري"
        subtitle="لوحة صاحب المتجر"
        open={open}
        onClose={() => setOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          onMenu={() => setOpen(true)}
          userName={user?.name || 'صاحب المتجر'}
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
