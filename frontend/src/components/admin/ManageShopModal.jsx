import { useState, useEffect } from 'react'
import {
  updateShop,
  extendSubscription,
  suspendShop,
  activateShop,
  deleteShop,
  getShopWhatsappSettings,
  updateShopWhatsappSettings,
} from '../../services/shopsService'
import { formatDateShort, daysRemaining } from '../../utils/format'
import { IconClose, IconWarning } from '../icons'
import { useLang } from '../../contexts/LanguageContext'
import strings from '../../utils/translations'

const EXTEND_MONTHS = [1, 3, 6, 12]

export default function ManageShopModal({ shop, onClose, onUpdated }) {
  const [form, setForm] = useState({ shopName: '', ownerName: '', phone: '' })
  const [whatsappForm, setWhatsappForm] = useState({
    apiUrl: '',
    apiKey: '',
    instanceName: '',
    senderPhone: '',
    connectionStatus: 'DISCONNECTED',
    hasApiKey: false,
  })
  const [saving, setSaving] = useState(false)
  const [savingWhatsapp, setSavingWhatsapp] = useState(false)
  const [loadingWhatsapp, setLoadingWhatsapp] = useState(false)
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
      setWhatsappForm({
        apiUrl: '',
        apiKey: '',
        instanceName: '',
        senderPhone: '',
        connectionStatus: 'DISCONNECTED',
        hasApiKey: false,
      })
      setLoadingWhatsapp(true)
      getShopWhatsappSettings(shop.id)
        .then((payload) => {
          const settings = payload?.settings || payload || {}
          setWhatsappForm({
            apiUrl: settings.apiUrl || '',
            apiKey: '',
            instanceName: settings.instanceName || settings.instanceId || '',
            senderPhone: settings.senderPhone || '',
            connectionStatus: settings.connectionStatus || 'DISCONNECTED',
            hasApiKey: Boolean(settings.hasApiKey),
          })
        })
        .catch(() => {
          setError('فشل تحميل إعدادات واتساب')
        })
        .finally(() => setLoadingWhatsapp(false))
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

  async function handleSaveWhatsapp(e) {
    e.preventDefault()
    setSavingWhatsapp(true)
    setError('')
    try {
      const payload = {
        provider: 'EVOLUTION',
        apiUrl: whatsappForm.apiUrl.trim() || null,
        instanceName: whatsappForm.instanceName.trim() || null,
        senderPhone: whatsappForm.senderPhone.trim() || null,
        connectionStatus: whatsappForm.connectionStatus,
      }

      if (whatsappForm.apiKey.trim()) {
        payload.apiKey = whatsappForm.apiKey.trim()
      }

      const result = await updateShopWhatsappSettings(shop.id, payload)
      const settings = result?.settings || result || {}
      setWhatsappForm((current) => ({
        ...current,
        apiKey: '',
        hasApiKey: Boolean(settings.hasApiKey || current.apiKey.trim()),
      }))
    } catch (err) {
      setError(err?.response?.data?.message || 'فشل حفظ إعدادات واتساب')
    } finally {
      setSavingWhatsapp(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl sm:max-h-[calc(100dvh-2rem)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-4 h-1.5 w-10 rounded-full bg-slate-200 sm:hidden" />
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h2 className="truncate font-bold text-ink-900">{shop.shopName}</h2>
            <p className="truncate text-xs text-ink-400">{shop.phone}</p>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-lg p-1.5 text-ink-400 hover:bg-slate-100 hover:text-ink-700">
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(100dvh-6.5rem)] space-y-5 overflow-y-auto overscroll-contain px-4 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] sm:max-h-[75vh] sm:px-5">
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
            <div className="grid grid-cols-2 gap-1.5 min-[380px]:grid-cols-4">
              {EXTEND_MONTHS.map((m, idx) => (
                <button key={m} onClick={() => handleExtend({ value: { addMonths: m } }, idx)}
                  disabled={extending !== null || settingDate}
                  className="rounded-lg border border-primary-200 bg-primary-50 py-2 text-sm font-medium text-primary-700 hover:bg-primary-100 disabled:opacity-50 transition">
                  {extending === idx ? '...' : t.extend[String(m)]}
                </button>
              ))}
            </div>

            {/* Exact date picker */}
            <div className="grid grid-cols-1 gap-2 pt-1 min-[380px]:grid-cols-[1fr_auto]">
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="input-base text-sm ltr-nums"
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

          {/* WhatsApp / Evolution settings */}
          <form onSubmit={handleSaveWhatsapp} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">WhatsApp / Evolution</p>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  whatsappForm.connectionStatus === 'CONNECTED'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-ink-500'
                }`}
              >
                {whatsappForm.connectionStatus === 'CONNECTED' ? 'متصل' : 'غير متصل'}
              </span>
            </div>

            {loadingWhatsapp ? (
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-ink-500">جاري تحميل إعدادات واتساب...</div>
            ) : (
              <>
                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">Evolution API URL</label>
                  <input
                    className="input-base w-full ltr-nums"
                    type="url"
                    dir="ltr"
                    placeholder="https://evolution.example.com"
                    value={whatsappForm.apiUrl}
                    onChange={(e) => setWhatsappForm((f) => ({ ...f, apiUrl: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">API Key</label>
                  <input
                    className="input-base w-full ltr-nums"
                    type="password"
                    dir="ltr"
                    placeholder={whatsappForm.hasApiKey ? 'محفوظة - اتركها فارغة لعدم التغيير' : 'Evolution API key'}
                    value={whatsappForm.apiKey}
                    onChange={(e) => setWhatsappForm((f) => ({ ...f, apiKey: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">Instance Name</label>
                  <input
                    className="input-base w-full ltr-nums"
                    dir="ltr"
                    placeholder="shop_ahmed"
                    value={whatsappForm.instanceName}
                    onChange={(e) => setWhatsappForm((f) => ({ ...f, instanceName: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">رقم واتساب المتجر</label>
                  <input
                    className="input-base w-full ltr-nums"
                    type="tel"
                    inputMode="numeric"
                    dir="ltr"
                    placeholder="8 أرقام فقط"
                    value={whatsappForm.senderPhone}
                    onChange={(e) => setWhatsappForm((f) => ({ ...f, senderPhone: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-ink-700">حالة الاتصال</label>
                  <select
                    className="input-base w-full"
                    value={whatsappForm.connectionStatus}
                    onChange={(e) => setWhatsappForm((f) => ({ ...f, connectionStatus: e.target.value }))}
                  >
                    <option value="DISCONNECTED">غير متصل</option>
                    <option value="CONNECTED">متصل</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={savingWhatsapp}
                  className="w-full rounded-xl bg-primary-600 py-2.5 text-sm font-medium text-white transition hover:bg-primary-700 disabled:opacity-50"
                >
                  {savingWhatsapp ? t.saving : 'حفظ إعدادات واتساب'}
                </button>
              </>
            )}
          </form>

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
                <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
                  <button onClick={handleDelete} disabled={deleting}
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50">
                    {deleting ? t.deleting : t.confirmDelete}
                  </button>
                  <button onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-slate-50">
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
