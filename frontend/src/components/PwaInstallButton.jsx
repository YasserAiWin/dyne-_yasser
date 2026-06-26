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
  const [showHelp, setShowHelp] = useState(false)
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

  const ios = isIos()
  const android = isAndroid()
  const canShow = installPrompt || ios || android
  if (!canShow) return null

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    setShowHelp(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-primary-100 bg-primary-50 text-primary-700 hover:bg-primary-100"
        aria-label="تثبيت التطبيق"
        title="تثبيت التطبيق"
      >
        <IconDownload className="h-5 w-5" />
      </button>

      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-3 sm:items-center sm:justify-center sm:p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-base font-bold text-ink-900">تثبيت التطبيق</h2>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-1.5 text-ink-500 hover:bg-slate-100"
                aria-label="إغلاق"
              >
                <IconClose className="h-5 w-5" />
              </button>
            </div>
            {android ? (
              <ol className="space-y-2 text-sm leading-6 text-ink-700">
                <li>1. افتح الموقع في Chrome.</li>
                <li>2. اضغط قائمة Chrome ⋮.</li>
                <li>3. اختر Install app أو Add to Home screen.</li>
              </ol>
            ) : (
              <ol className="space-y-2 text-sm leading-6 text-ink-700">
                <li>1. افتح الرابط في Safari.</li>
                <li>2. اضغط زر المشاركة.</li>
                <li>3. اختر Add to Home Screen.</li>
              </ol>
            )}
          </div>
        </div>
      )}
    </>
  )
}
