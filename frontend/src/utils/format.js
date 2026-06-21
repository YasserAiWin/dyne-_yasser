// Shared formatting helpers.

// Currency in Mauritanian Ouguiya, Western digits, LTR-safe.
export function formatCurrency(amount) {
  const n = Number(amount) || 0
  return `${n.toLocaleString('en-US')} MRU`
}

// Plain number with thousands separator.
export function formatNumber(n) {
  return (Number(n) || 0).toLocaleString('en-US')
}

// Full date — always Latin numerals.
export function formatDate(iso, locale = 'ar-EG-u-nu-latn') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })
}

// Short compact date: "21 أغس 2026" or "21 Aug 2026" — for tight list rows.
export function formatDateShort(iso, locale = 'ar-EG-u-nu-latn') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
}

// Whole days between today and an end date (negative = already passed).
export function daysRemaining(endDate) {
  if (!endDate) return 0
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((end - today) / (1000 * 60 * 60 * 24))
}

// Add N months to an ISO date, returning a new ISO date.
export function addToDate(iso, { days = 0, months = 0, years = 0 }) {
  const d = iso ? new Date(iso) : new Date()
  d.setFullYear(d.getFullYear() + years)
  d.setMonth(d.getMonth() + months)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
