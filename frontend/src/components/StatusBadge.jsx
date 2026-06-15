// Maps a status key to Arabic label + color classes.
const STATUS = {
  // Shop subscription statuses
  active: { label: 'نشط', class: 'bg-primary-50 text-primary-700 border-primary-100' },
  expiring: { label: 'قرب الانتهاء', class: 'bg-orange-50 text-orange-600 border-orange-100' },
  expired: { label: 'منتهي', class: 'bg-red-50 text-red-600 border-red-100' },

  // Customer balance statuses
  debtor: { label: 'مدين', class: 'bg-red-50 text-red-600 border-red-100' },
  settled: { label: 'مسدد', class: 'bg-primary-50 text-primary-700 border-primary-100' },
  credit: { label: 'له رصيد', class: 'bg-blue-50 text-blue-600 border-blue-100' },

  // Transaction types
  debt: { label: 'دين', class: 'bg-red-50 text-red-600 border-red-100' },
  payment: { label: 'دفعة', class: 'bg-primary-50 text-primary-700 border-primary-100' },
}

export default function StatusBadge({ status }) {
  const meta = STATUS[status] || { label: status, class: 'bg-slate-50 text-ink-500 border-slate-200' }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${meta.class}`}
    >
      <span className="ml-1.5 h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {meta.label}
    </span>
  )
}
