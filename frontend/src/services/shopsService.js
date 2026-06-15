import api, { USE_MOCK, mockDelay, unwrapApiResponse } from './api'
import { shops, adminStats } from '../data/mockData'

// Normalize a shops payload that may be an array or { shops: [...] }.
function toShopsArray(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.shops)) return payload.shops
  return []
}

export async function getShops() {
  if (USE_MOCK) return mockDelay([...shops])
  const { data } = await api.get('/admin/shops')
  return toShopsArray(unwrapApiResponse(data))
}

export async function getShop(id) {
  if (USE_MOCK) return mockDelay(shops.find((s) => s.id === Number(id)) || null)
  const { data } = await api.get(`/admin/shops/${id}`)
  const payload = unwrapApiResponse(data)
  // Backend may wrap the entity as { shop: {...} }.
  return payload?.shop ?? payload
}

// Map backend admin dashboard fields to the keys the UI expects.
function normalizeAdminStats(p) {
  if (!p || typeof p !== 'object') return p
  return {
    totalShops: p.totalShops ?? p.totalShopsCount ?? 0,
    activeShops: p.activeShops ?? p.activeShopsCount ?? 0,
    expiringShops: p.expiringShops ?? p.expiringShopsCount ?? 0,
    expiredShops: p.expiredShops ?? p.expiredShopsCount ?? 0,
    suspendedShops: p.suspendedShops ?? p.suspendedShopsCount ?? 0,
    renewalsThisMonth: p.renewalsThisMonth ?? 0,
  }
}

export async function getAdminStats() {
  if (USE_MOCK) return mockDelay({ ...adminStats })
  const { data } = await api.get('/admin/dashboard')
  return normalizeAdminStats(unwrapApiResponse(data))
}

export async function getExpiringShops() {
  if (USE_MOCK) return mockDelay(shops.filter((s) => s.status === 'expiring'))
  const { data } = await api.get('/admin/shops-expiring')
  return toShopsArray(unwrapApiResponse(data))
}

export async function getExpiredShops() {
  if (USE_MOCK) return mockDelay(shops.filter((s) => s.status === 'expired'))
  const { data } = await api.get('/admin/shops-expired')
  return toShopsArray(unwrapApiResponse(data))
}

export async function createShop(payload) {
  if (USE_MOCK) return mockDelay({ id: Date.now(), ...payload, status: 'active' })
  const { data } = await api.post('/admin/shops', payload)
  return unwrapApiResponse(data)
}

export async function updateShop(id, payload) {
  if (USE_MOCK) return mockDelay({ id, ...payload })
  const { data } = await api.put(`/admin/shops/${id}`, payload)
  return unwrapApiResponse(data)
}

// Extend a subscription. payload: { newEndDate }
export async function extendSubscription(id, payload) {
  if (USE_MOCK) return mockDelay({ id, ...payload })
  const { data } = await api.post(`/admin/shops/${id}/extend-subscription`, payload)
  return unwrapApiResponse(data)
}
