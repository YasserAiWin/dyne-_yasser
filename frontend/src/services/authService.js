import api, { USE_MOCK, mockDelay, unwrapApiResponse } from './api'

// Map backend roles (SUPER_ADMIN / SHOP_OWNER) to the frontend's
// internal role keys (admin / owner) used by routing and guards.
// Already-normalized values pass through unchanged.
export function normalizeUserRole(role) {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'admin':
      return 'admin'
    case 'SHOP_OWNER':
    case 'owner':
      return 'owner'
    default:
      return role
  }
}

// Store the user with a normalized `role` (so routing/guards work) while
// preserving the backend's original value under `rawRole`.
function persistUser(user) {
  if (!user) return user
  const normalized = {
    ...user,
    role: normalizeUserRole(user.role),
    rawRole: user.role,
  }
  localStorage.setItem('user', JSON.stringify(normalized))
  return normalized
}

// role: 'admin' | 'owner' — used for mock routing only.
// Real API derives the role from the returned user/JWT, not from the request.
export async function login({ phone, password, role }) {
  if (USE_MOCK) {
    // Accept any credentials in mock mode.
    const user = {
      id: role === 'admin' ? 0 : 1,
      name: role === 'admin' ? 'المدير العام' : 'صاحب المتجر',
      role,
      phone,
    }
    const token = `mock-token-${role}`
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return mockDelay({ user, token })
  }

  const { data } = await api.post('/auth/login', { phone, password })
  const payload = unwrapApiResponse(data)

  if (payload.token) {
    localStorage.setItem('token', payload.token)
    payload.user = persistUser(payload.user)
  }
  return payload
}

export async function getMe() {
  if (USE_MOCK) return mockDelay(getCurrentUser())
  const { data } = await api.get('/auth/me')
  const payload = unwrapApiResponse(data)
  const user = persistUser(payload.user || payload)
  return user
}

export function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user'))
  } catch {
    return null
  }
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('token'))
}
