// Soft, tinted accent per tone — kept minimal (emerald / red / orange / blue).
const tones = {
  primary: 'bg-primary-50 text-primary-600',
  red: 'bg-red-50 text-red-600',
  orange: 'bg-orange-50 text-orange-600',
  blue: 'bg-blue-50 text-blue-600',
  slate: 'bg-slate-100 text-ink-500',
}

export default function StatCard({ label, value, icon, tone = 'primary', suffix = '' }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-ink-500">{label}</p>
          <p className="mt-2 text-xl font-bold text-ink-900">
            <span className="ltr-nums">{value}</span>
            {suffix && <span className="mr-1 text-sm font-normal text-ink-400">{suffix}</span>}
          </p>
        </div>
        {icon && (
          <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}>
            {icon}
          </span>
        )}
      </div>
    </div>
  )
}
