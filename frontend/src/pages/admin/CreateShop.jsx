import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { createShop } from '../../services/shopsService'
import { subscriptionPlans } from '../../data/mockData'
import { addToDate, formatDate } from '../../utils/format'
import { IconShop, IconUser, IconPhone, IconLock, IconCheck } from '../../components/icons'

export default function CreateShop() {
  const navigate = useNavigate()
  const today = new Date().toISOString().slice(0, 10)

  const [form, setForm] = useState({
    name: '',
    ownerName: '',
    phone: '',
    password: '',
    plan: 'yearly',
    customEndDate: '',
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  function update(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const selectedPlan = subscriptionPlans.find((p) => p.id === form.plan)

  // Custom date overrides the plan duration when provided.
  const computedEndDate = useMemo(() => {
    if (form.customEndDate) return form.customEndDate
    return addToDate(today, { months: selectedPlan?.months || 0 })
  }, [form.customEndDate, selectedPlan, today])

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await createShop({
        ...form,
        startDate: today,
        endDate: computedEndDate,
        plan: selectedPlan?.label,
      })
      setDone(true)
      setTimeout(() => navigate('/admin/shops'), 900)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Main form */}
      <div className="space-y-6 lg:col-span-2">
        <Card title="بيانات المتجر">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="اسم المتجر" name="name" value={form.name} onChange={update}
              placeholder="مثال: بقالة الأمانة" icon={<IconShop className="h-5 w-5" />} required />
            <Input label="اسم المالك" name="ownerName" value={form.ownerName} onChange={update}
              placeholder="الاسم الكامل" icon={<IconUser className="h-5 w-5" />} required />
            <Input label="رقم الهاتف" name="phone" type="tel" value={form.phone} onChange={update}
              placeholder="+222 XX XX XX XX" icon={<IconPhone className="h-5 w-5" />} required
              hint="يُستخدم رقم الهاتف لتسجيل دخول صاحب المتجر" />
            <Input label="كلمة المرور" name="password" type="password" value={form.password} onChange={update}
              placeholder="••••••••" icon={<IconLock className="h-5 w-5" />} required />
          </div>
        </Card>

        <Card title="تفاصيل الاشتراك">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="مدة الاشتراك"
              as="select"
              name="plan"
              value={form.plan}
              onChange={update}
              options={subscriptionPlans.map((p) => ({ value: p.id, label: p.label }))}
            />
            <Input
              label="تاريخ انتهاء مخصص (اختياري)"
              name="customEndDate"
              type="date"
              value={form.customEndDate}
              onChange={update}
              hint="يتجاوز مدة الاشتراك عند تحديده"
            />
          </div>
        </Card>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <div className="space-y-4 lg:sticky lg:top-24">
          <Card title="ملخص الاشتراك">
            <dl className="space-y-3 text-sm">
              <Row label="المتجر" value={form.name || '—'} />
              <Row label="المالك" value={form.ownerName || '—'} />
              <Row label="الخطة" value={selectedPlan?.label || '—'} />
              <Row label="تاريخ البداية" value={<span className="ltr-nums">{formatDate(today)}</span>} />
              <div className="border-t border-slate-100 pt-3">
                <Row
                  label="تاريخ الانتهاء"
                  value={<span className="ltr-nums font-bold text-primary-700">{formatDate(computedEndDate)}</span>}
                />
              </div>
            </dl>

            <Button type="submit" size="lg" className="mt-5 w-full" disabled={saving || done}
              icon={done ? <IconCheck className="h-5 w-5" /> : null}>
              {done ? 'تم الإنشاء بنجاح' : saving ? 'جارٍ الحفظ...' : 'إنشاء المتجر'}
            </Button>
          </Card>

          <div className="rounded-2xl border border-primary-100 bg-primary-50 p-4 text-sm text-primary-800">
            سيتم إرسال بيانات الدخول إلى صاحب المتجر عبر رقم الجوال المسجّل.
          </div>
        </div>
      </div>
    </form>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900">{value}</dd>
    </div>
  )
}
