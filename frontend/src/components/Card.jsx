export default function Card({ title, action, children, className = '', bodyClass = '' }) {
  return (
    <div className={`card ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          {title && <h3 className="text-sm font-bold text-ink-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className={`p-5 ${bodyClass}`}>{children}</div>
    </div>
  )
}
