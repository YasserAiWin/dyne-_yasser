import { useEffect, useState } from 'react'
import { IconClose, IconDownload } from './icons'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

function isAndroid() {
  return /android/i.test(window.navigator.userAgent)
}

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [standalone, setStandalone] = useState(false)

  useEffect(() => {
    setStandalone(isStandalone())

    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }

    const handleInstalled = () => {
      setInstallPrompt(null)
      setStandalone(true)
      setShowModal(false)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (standalone) return null

  const ios = isIos()
  const android = isAndroid()
  if (!installPrompt && !ios && !android) return null

  async function handleInstallNow() {
    if (!installPrompt) return
    installPrompt.prompt()
    await installPrompt.userChoice
    setInstallPrompt(null)
    setShowModal(false)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100"
        aria-label="تثبيت التطبيق"
        title="تثبيت التطبيق"
      >
        <IconDownload className="h-5 w-5" />
      </button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative w-full rounded-t-2xl bg-white px-5 pb-8 pt-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-200" />

            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-ink-500 hover:bg-slate-200"
              aria-label="إغلاق"
            >
              <IconClose className="h-5 w-5" />
            </button>

            <h2 className="mb-2 text-center text-xl font-bold text-ink-900">
              تثبيت التطبيق على الهاتف
            </h2>
            <p className="mb-5 text-center text-sm leading-6 text-ink-500">
              بعد التثبيت يفتح التطبيق من الشاشة الرئيسية مثل تطبيق عادي،
              وإذا بقي الحساب مسجلاً سيفتح مباشرة على المحل.
            </p>

            <div className="mb-5 space-y-3">
              {(android || (!ios && !android)) && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-1 font-bold text-ink-900">Android</p>
                  <p className="text-sm leading-6 text-ink-600">
                    افتح الموقع في Chrome أو Brave أو Edge، ثم من القائمة اختر:
                    تثبيت التطبيق أو Add to Home screen.
                  </p>
                </div>
              )}
              {(ios || (!ios && !android)) && (
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-1 font-bold text-ink-900">iPhone</p>
                  <p className="text-sm leading-6 text-ink-600">
                    استخدم Safari، ثم زر المشاركة، ثم Add to Home Screen. إذا كنت داخل
                    Chrome أو Brave على iPhone ولم يظهر الخيار، افتح نفس الرابط في Safari.
                  </p>
                </div>
              )}
            </div>

            {installPrompt && (
              <button
                type="button"
                onClick={handleInstallNow}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-4 text-base font-bold text-white active:bg-primary-700"
              >
                <IconDownload className="h-5 w-5" />
                تثبيت الآن
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
