import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { login, normalizeUserRole } from '../../services/authService'
import { USE_MOCK } from '../../services/api'
import { IconLock, IconShop, IconUsers, IconPhone } from '../../components/icons'

export default function Login() {
  const [role, setRole] = useState('owner') // 'owner' | 'admin'
  const [form, setForm] = useState({ phone: '', password: '', remember: true })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function update(e) {
    const { name, value, type, checked } = e.target
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = await login({ phone: form.phone, password: form.password, role })
      // In mock mode the selected tab drives navigation. In real API mode the
      // backend-returned user role is authoritative (SUPER_ADMIN / SHOP_OWNER).
      const effectiveRole = USE_MOCK
        ? role
        : normalizeUserRole(result?.user?.role) || role
      navigate(effectiveRole === 'admin' ? '/admin/dashboard' : '/shop/dashboard')
    } catch (err) {
      setError('فشل تسجيل الدخول. تحقق من البيانات وحاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="card p-6 sm:p-8">
          {/* Brand */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-xl font-bold text-white">
              د
            </div>
            <h1 className="text-xl font-bold text-ink-900">تسجيل الدخول</h1>
          </div>

          {/* Role tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setRole('owner')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'owner' ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500'
              }`}
            >
              <IconShop className="h-4 w-4" />
              صاحب المتجر
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition ${
                role === 'admin' ? 'bg-white text-primary-700 shadow-sm' : 'text-ink-500'
              }`}
            >
              <IconUsers className="h-4 w-4" />
              المدير العام
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="رقم الهاتف"
              name="phone"
              type="tel"
              placeholder="+222 XX XX XX XX"
              value={form.phone}
              onChange={update}
              icon={<IconPhone className="h-5 w-5" />}
              required
            />
            <Input
              label="كلمة المرور"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={update}
              icon={<IconLock className="h-5 w-5" />}
              required
            />

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-500">
                <input
                  type="checkbox"
                  name="remember"
                  checked={form.remember}
                  onChange={update}
                  className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                />
                تذكرني
              </label>
              <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                نسيت كلمة المرور؟
              </a>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'جارٍ الدخول...' : 'تسجيل الدخول'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
