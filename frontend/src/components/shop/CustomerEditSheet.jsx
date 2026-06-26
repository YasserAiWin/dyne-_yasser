import { useState, useEffect } from 'react'
import { updateCustomer, deleteCustomer } from '../../services/customersService'
import { IconClose, IconUser, IconPhone, IconWarning } from '../icons'

export default function CustomerEditSheet({ open, customer, onClose, onUpdated, onDeleted }) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (open && customer) {
      setName(customer.name || '')
      setPhone(customer.phone || '')
      setConfirmDelete(false)
      setError('')
    }
  }, [open, customer])

  if (!open || !customer) return null

  async function handleSave(e) {
    e.preventDefault()
    if (!name.trim()) { setError('أدخل اسم العميل'); return }
    setSaving(true)
    setError('')
    try {
      const updated = await updateCustomer(customer.id, { name: name.trim(), phone: phone.trim() || undefined })
      onUpdated(updated)
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل حفظ التغييرات')
      setSaving(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await deleteCustomer(customer.id)
      onDeleted(customer.id)
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل حذف العميل')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40" onClick={saving || deleting ? undefined : onClose} aria-hidden />

      <div className="relative max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-3xl bg-white p-4 shadow-soft sm:max-h-[calc(100dvh-2rem)] sm:p-5">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="min-w-0 text-lg font-bold text-ink-900">تعديل العميل</h3>
          <button onClick={onClose} disabled={saving || deleting} className="shrink-0 rounded-lg p-1 text-ink-400 hover:bg-slate-50 hover:text-ink-700 disabled:opacity-50">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">اسم العميل</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                <IconUser className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-base w-full pr-9"
                placeholder="الاسم الكامل"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">رقم الهاتف</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                <IconPhone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input-base w-full pr-9 ltr-nums"
                placeholder="XX XX XX XX"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-primary-600 py-3 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>

        {/* Delete section */}
        <div className="mt-4">
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition"
            >
              حذف العميل
            </button>
          ) : (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <IconWarning className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                <p className="text-sm text-red-700">سيُحذف العميل وجميع معاملاته. لا يمكن التراجع.</p>
              </div>
              <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? 'جارٍ الحذف...' : 'نعم، احذف'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-slate-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
