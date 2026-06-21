import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import { login } from '../../services/authService'
import { IconEmail, IconLock } from '../../components/icons'

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function update(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login({ role: 'admin', email: form.email, password: form.password })
      navigate('/admin/dashboard')
    } catch (err) {
      const msg = err?.response?.data?.message
      setError(msg || 'البريد الإلكتروني أو كلمة المرور غير صحيحة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-sm">
        <div className="card p-6 sm:p-8">

          <div className="mb-8 flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-900 text-2xl font-bold text-white shadow-md">
              د
            </div>
            <div className="text-center">
              <h1 className="text-xl font-bold text-ink-900">لوحة المدير العام</h1>
              <p className="mt-0.5 text-sm text-ink-400">للمديرين فقط</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* Email */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">البريد الإلكتروني</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                  <IconEmail className="h-5 w-5" />
                </span>
                <input
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={update}
                  className="input-base w-full pr-10"
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">كلمة المرور</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
                  <IconLock className="h-5 w-5" />
                </span>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={update}
                  className="input-base w-full pr-10"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'جارٍ الدخول...' : 'دخول'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
