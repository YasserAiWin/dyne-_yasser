import { useState } from 'react'
import { createShop } from '../../services/shopsService'
import { IconClose, IconShop, IconPhone, IconLock } from '../icons'
import { useLang } from '../../contexts/LanguageContext'
import strings from '../../utils/translations'

const empty = { shopName: '', phone: '', pin: '' }

export default function CreateShopModal({ onClose, onCreated }) {
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const { lang } = useLang()
  const t = strings[lang]

  function update(e) {
    const { name, value } = e.target
    if (name === 'pin') {
      setForm((f) => ({ ...f, pin: value.replace(/\D/g, '').slice(0, 8) }))
      return
    }
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.pin.length < 4) {
      setError(lang === 'en' ? 'PIN must be at least 4 digits' : 'الرمز السري يجب أن يكون 4 أرقام على الأقل')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createShop({
        shopName: form.shopName,
        ownerName: form.shopName, // default owner name = shop name
        phone: form.phone,
        pin: form.pin,
        startDate: new Date().toISOString(),
        subscriptionDuration: '1_year', // default 1 year
      })
      onCreated()
    } catch (err) {
      setError(err?.response?.data?.message || (lang === 'en' ? 'Failed to create shop' : 'فشل إنشاء المتجر'))
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-bold text-ink-900">{t.createShop}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 hover:text-ink-700">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-5 py-5">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">{error}</div>
          )}

          {/* Shop name */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">{t.shopName}</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                <IconShop className="h-4 w-4" />
              </span>
              <input
                name="shopName"
                className="input-base w-full pr-9"
                value={form.shopName}
                onChange={update}
                placeholder={t.shopNamePlaceholder}
                autoComplete="off"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">{t.phone}</label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                <IconPhone className="h-4 w-4" />
              </span>
              <input
                name="phone"
                type="tel"
                inputMode="tel"
                className="input-base w-full pr-9"
                value={form.phone}
                onChange={update}
                placeholder="XX XX XX XX"
                autoComplete="off"
                required
              />
            </div>
            <p className="mt-1 text-xs text-ink-400">{t.loginPhone}</p>
          </div>

          {/* PIN */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">
              {t.pin}
              <span className="mx-1.5 text-xs font-normal text-ink-400">({t.pinHint})</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                <IconLock className="h-4 w-4" />
              </span>
              <input
                name="pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                className="input-base w-full pr-9 tracking-widest"
                value={form.pin}
                onChange={update}
                placeholder="••••••••"
                maxLength={8}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="flex-1 rounded-xl bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50">
              {saving ? t.creating : t.createBtn}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-ink-700 hover:bg-slate-50">
              {t.cancelBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
