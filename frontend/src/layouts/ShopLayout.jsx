import { Outlet, useNavigate, useLocation, matchPath } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import PwaInstallButton from '../components/PwaInstallButton'
import ShopTabs from '../components/shop/ShopTabs'
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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getCurrentUser()

  let [title, subtitle] = titles[pathname] || ['متجري', '']
  if (matchPath('/shop/customers/:id', pathname)) {
    title = 'ملف العميل'
    subtitle = 'تفاصيل الحساب والمعاملات'
  }

  // Mobile shows the top tabs only on the two main shop pages.
  const showMobileTabs =
    pathname === '/shop/customers' || pathname === '/shop/dashboard'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar: desktop only — no drawer/hamburger on mobile. */}
      <div className="hidden lg:flex">
        <Sidebar
          items={navItems}
          title="متجري"
          subtitle="لوحة صاحب المتجر"
          open={false}
          onClose={() => {}}
          onLogout={handleLogout}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* No onMenu => Header renders no hamburger on the shop pages. */}
        <Header
          title={title}
          subtitle={subtitle}
          userName={user?.name || 'صاحب المتجر'}
          extra={<PwaInstallButton />}
        />

        {/* Mobile top tab bar (replaces the drawer navigation). */}
        {showMobileTabs && (
          <div className="border-b border-slate-100 bg-white px-4 pt-2 lg:hidden">
            <ShopTabs />
          </div>
        )}

        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
