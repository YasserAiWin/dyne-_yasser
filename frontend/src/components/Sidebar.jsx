import { NavLink } from 'react-router-dom'
import { IconLogout, IconClose } from './icons'

// Generic sidebar. `items` is [{ to, label, icon }]. Sits on the RIGHT (RTL).
export default function Sidebar({ items, title, subtitle, open, onClose, onLogout }) {
  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-64 flex-col border-l border-slate-100 bg-white
          transition-transform duration-200 lg:static lg:z-0 lg:translate-x-0
          ${open ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white font-bold">
              د
            </div>
            <div>
              <p className="text-sm font-bold leading-tight text-ink-900">{title}</p>
              <p className="text-xs text-ink-400">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-ink-400 lg:hidden" aria-label="إغلاق">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-ink-500 hover:bg-slate-50 hover:text-ink-700'
                }`
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="border-t border-slate-100 p-3">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <IconLogout className="h-5 w-5" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  )
}
