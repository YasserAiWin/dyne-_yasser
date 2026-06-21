import { useState, useEffect } from 'react'
import { updateShop, extendSubscription, suspendShop, activateShop, deleteShop } from '../../services/shopsService'
import { formatDateShort, daysRemaining } from '../../utils/format'
import { IconClose, IconWarning } from '../icons'
import { useLang } from '../../contexts/LanguageContext'
import strings from '../../utils/translations'

const EXTEND_MONTHS = [1, 3, 6, 12]

export default function ManageShopModal({ shop, onClose, onUpdated }) {
  const [form, setForm] = useState({ shopName: '', ownerName: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [extending, setExtending] = useState(null)
  const [customDate, setCustomDate] = useState('')
  const [settingDate, setSettingDate] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')
  const { lang } = useLang()
  const t = strings[lang]

  useEffect(() => {
    if (shop) {
      setForm({ shopName: shop.shopName, ownerName: shop.ownerName, phone: shop.phone || '' })
      setCustomDate(shop.expiryDate ? new Date(shop.expiryDate).toISOString().slice(0, 10) : '')
      setConfirmDelete(false)
      setError('')
    }
  }, [shop])

  if (!shop) return null

  const days = daysRemaining(shop.expiryDate)
  const isSuspended = shop.isSuspended

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const updatePayload = { shopName: form.shopName, ownerName: form.ownerName }
      if (form.phone.trim()) updatePayload.phone = form.phone.trim()
      await updateShop(shop.id, updatePayload)
      onUpdated()
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل حفظ التغييرات')
    } finally {
      setSaving(false)
    }
  }

  async function handleExtend(option, idx) {
    setExtending(idx)
    setError('')
    try {
      await extendSubscription(shop.id, option.value)
      onUpdated()
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تمديد الاشتراك')
    } finally {
      setExtending(null)
    }
  }

  async function handleSetDate() {
    if (!customDate) return
    setSettingDate(true)
    setError('')
    try {
      await extendSubscription(shop.id, { customExpiryDate: customDate })
      onUpdated()
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل تعيين التاريخ')
    } finally {
      setSettingDate(false)
    }
  }

  async function handleToggleSuspend() {
    setToggling(true)
    setError('')
    try {
      if (isSuspended) {
        await activateShop(shop.id)
      } else {
        await suspendShop(shop.id)
      }
      onUpdated()
    } catch (err) {
      setError(err?.response?.data?.message || 'فشلت العملية')
    } finally {
      setToggling(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    setError('')
    try {
      await deleteShop(shop.id)
      onUpdated()
      onClose()
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل حذف المتجر')
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-ink-900">{shop.shopName}</h2>
            <p className="text-xs text-ink-400">{shop.phone}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 hover:text-ink-700">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto px-5 py-4 space-y-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}

          {/* Edit basic info */}
          <form onSubmit={handleSave} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.shopDetails}</p>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">{t.shopName}</label>
              <input className="input-base w-full" value={form.shopName}
                onChange={(e) => setForm((f) => ({ ...f, shopName: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">{t.ownerName}</label>
              <input className="input-base w-full" value={form.ownerName}
                onChange={(e) => setForm((f) => ({ ...f, ownerName: e.target.value }))} required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-ink-700">{t.phone}</label>
              <input className="input-base w-full ltr-nums" type="tel" inputMode="tel"
                value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
            <button type="submit" disabled={saving}
              className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50">
              {saving ? t.saving : t.save}
            </button>
          </form>

          <hr className="border-slate-100" />

          {/* Subscription extend */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.subscription}</p>
            <div className="rounded-xl bg-slate-50 px-4 py-2.5 text-sm">
              <span className="text-ink-500">{t.currentExpiry} </span>
              <span className="font-medium text-ink-900 ltr-nums">{formatDateShort(shop.expiryDate, lang === 'en' ? 'en-US' : 'ar-EG-u-nu-latn')}</span>
              <span className={`mx-2 font-semibold ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-orange-600' : 'text-emerald-600'}`}>
                ({t.daysLeft(days)})
              </span>
            </div>
            {/* Quick extend buttons */}
            <div className="grid grid-cols-4 gap-1.5">
              {EXTEND_MONTHS.map((m, idx) => (
                <button key={m} onClick={() => handleExtend({ value: { addMonths: m } }, idx)}
                  disabled={extending !== null || settingDate}
                  className="rounded-lg border border-primary-200 bg-primary-50 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-50 transition">
                  {extending === idx ? '...' : t.extend[String(m)]}
                </button>
              ))}
            </div>

            {/* Exact date picker */}
            <div className="flex gap-2 pt-1">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="input-base flex-1 text-sm ltr-nums"
                style={{ direction: 'ltr' }}
              />
              <button
                onClick={handleSetDate}
                disabled={!customDate || settingDate || extending !== null}
                className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-ink-700 disabled:opacity-50"
              >
                {settingDate ? '...' : lang === 'en' ? 'Set' : 'تعيين'}
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Suspend / Activate */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.status}</p>
            <button onClick={handleToggleSuspend} disabled={toggling}
              className={`w-full rounded-xl py-2.5 text-sm font-medium transition disabled:opacity-50 ${
                isSuspended
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
              }`}>
              {toggling ? '...' : isSuspended ? t.activate : t.suspend}
            </button>
          </div>

          <hr className="border-slate-100" />

          {/* Delete */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">{t.dangerZone}</p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-medium text-red-600 hover:bg-red-100 transition">
                {t.deleteShop}
              </button>
            ) : (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
                <div className="flex items-start gap-2.5">
                  <IconWarning className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                  <p className="text-sm text-red-700">{t.deleteWarning}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDelete} disabled={deleting}
                    className="flex-1 rounded-lg bg-red-600 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition">
                    {deleting ? t.deleting : t.confirmDelete}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="flex-1 rounded-lg bg-white py-2 text-sm font-medium text-ink-700 border border-slate-200 hover:bg-slate-50 transition">
                    {t.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
