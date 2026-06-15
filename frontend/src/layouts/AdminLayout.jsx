import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import { logout, getCurrentUser } from '../services/authService'
import { IconDashboard, IconShop, IconPlus, IconSubscription } from '../components/icons'

const navItems = [
  { to: '/admin/dashboard', label: 'لوحة التحكم', icon: IconDashboard, end: true },
  { to: '/admin/shops', label: 'المتاجر', icon: IconShop, end: true },
  { to: '/admin/shops/create', label: 'إضافة متجر', icon: IconPlus },
  { to: '/admin/subscriptions', label: 'إدارة الاشتراكات', icon: IconSubscription },
]

// Map current path -> page title for the header.
const titles = {
  '/admin/dashboard': ['لوحة التحكم', 'نظرة عامة على المنصة'],
  '/admin/shops': ['المتاجر', 'إدارة جميع المتاجر المشتركة'],
  '/admin/shops/create': ['إضافة متجر جديد', 'تسجيل متجر واشتراك جديد'],
  '/admin/subscriptions': ['إدارة الاشتراكات', 'تجديد وتمديد الاشتراكات'],
}

export default function AdminLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()

  const [title, subtitle] = titles[pathname] || ['لوحة المدير العام', '']

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        items={navItems}
        title="إدارة الديون"
        subtitle="لوحة المدير العام"
        open={open}
        onClose={() => setOpen(false)}
        onLogout={handleLogout}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          title={title}
          subtitle={subtitle}
          onMenu={() => setOpen(true)}
          userName={user?.name || 'المدير العام'}
        />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
