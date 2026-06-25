import { useEffect, useState } from 'react'
import { IconClose, IconDownload } from './icons'

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function isIos() {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showIosHelp, setShowIosHelp] = useState(false)
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
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (standalone) return null

  const canShow = installPrompt || isIos()
  if (!canShow) return null

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    setShowIosHelp(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-primary-700 hover:bg-primary-50"
        aria-label="تثبيت التطبيق"
        title="تثبيت التطبيق"
      >
        <IconDownload className="h-5 w-5" />
      </button>

      {showIosHelp && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-sm rounded-lg bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-ink-900">تثبيت التطبيق</h2>
              <button
                type="button"
                onClick={() => setShowIosHelp(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100"
                aria-label="إغلاق"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            <ol className="space-y-2 text-sm leading-6 text-ink-700">
              <li>1. افتح الرابط في Safari.</li>
              <li>2. اضغط زر المشاركة.</li>
              <li>3. اختر Add to Home Screen.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
