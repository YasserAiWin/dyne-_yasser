import api, { USE_MOCK, mockDelay, unwrapApiResponse } from './api'
import { customers, shopStats } from '../data/mockData'

// Normalize a customers payload that may be an array or { customers: [...] }.
function toCustomersArray(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.customers)) return payload.customers
  return []
}

export async function getCustomers() {
  if (USE_MOCK) return mockDelay([...customers])
  const { data } = await api.get('/shop/customers')
  return toCustomersArray(unwrapApiResponse(data))
}

export async function getCustomer(id) {
  if (USE_MOCK) return mockDelay(customers.find((c) => c.id === Number(id)) || null)
  const { data } = await api.get(`/shop/customers/${id}`)
  const payload = unwrapApiResponse(data)
  // Backend may wrap the entity as { customer: {...} }.
  return payload?.customer ?? payload
}

// Map backend shop dashboard fields to the keys the UI expects.
function normalizeShopStats(p) {
  if (!p || typeof p !== 'object') return p
  return {
    totalCustomers: p.totalCustomers ?? 0,
    totalDebt: p.totalDebt ?? p.totalOutstandingDebt ?? 0,
    debtorsCount: p.debtorsCount ?? p.debtCustomersCount ?? 0,
    creditorsCount: p.creditorsCount ?? p.creditCustomersCount ?? 0,
    settledCount: p.settledCount ?? p.settledCustomersCount ?? 0,
    todayPayments: p.todayPayments ?? 0,
  }
}

export async function getShopStats() {
  if (USE_MOCK) return mockDelay({ ...shopStats })
  const { data } = await api.get('/shop/dashboard')
  return normalizeShopStats(unwrapApiResponse(data))
}

export async function createCustomer(payload) {
  if (USE_MOCK) return mockDelay({ id: Date.now(), balance: 0, status: 'settled', ...payload })
  const { data } = await api.post('/shop/customers', payload)
  const result = unwrapApiResponse(data)
  // Backend wraps as { customer: {...} } — normalize to flat object
  return result?.customer ?? result
}

export async function updateCustomer(id, payload) {
  if (USE_MOCK) return mockDelay({ id, ...payload })
  const { data } = await api.put(`/shop/customers/${id}`, payload)
  const result = unwrapApiResponse(data)
  return result?.customer ?? result
}

export async function deleteCustomer(id) {
  if (USE_MOCK) return mockDelay({ id })
  const { data } = await api.delete(`/shop/customers/${id}`)
  return unwrapApiResponse(data)
}
