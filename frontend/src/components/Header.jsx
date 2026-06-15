import { IconMenu, IconBell } from './icons'

export default function Header({ title, subtitle, onMenu, userName = 'مستخدم' }) {
  const initials = userName.trim().charAt(0) || 'م'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/90 px-4 py-3.5 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        {/* Hamburger only when a menu handler is provided (admin uses a drawer;
            the shop-owner pages use top tabs and pass no onMenu). */}
        {onMenu && (
          <button
            onClick={onMenu}
            className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100 lg:hidden"
            aria-label="القائمة"
          >
            <IconMenu className="h-6 w-6" />
          </button>
        )}
        <div>
          <h1 className="text-base font-bold text-ink-900 md:text-lg">{title}</h1>
          {subtitle && <p className="text-xs text-ink-400">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <button className="relative rounded-xl p-2 text-ink-500 hover:bg-slate-100" aria-label="الإشعارات">
          <IconBell className="h-5 w-5" />
          <span className="absolute left-2 top-2 h-2 w-2 rounded-full bg-red-500" />
        </button>
        <div className="flex items-center gap-2.5">
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium text-ink-900">{userName}</p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
            {initials}
          </div>
        </div>
      </div>
    </header>
  )
}
