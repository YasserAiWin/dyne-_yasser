import { HashRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { LanguageProvider } from './contexts/LanguageContext'

export default function App() {
  return (
    <LanguageProvider>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
    </LanguageProvider>
  )
}
