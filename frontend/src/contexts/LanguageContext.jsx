import { createContext, useContext, useState } from 'react'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('adminLang') || 'ar')

  function toggleLang() {
    const next = lang === 'ar' ? 'en' : 'ar'
    localStorage.setItem('adminLang', next)
    setLang(next)
  }

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, isEn: lang === 'en' }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  return useContext(LanguageContext)
}
