import api, { USE_MOCK, mockDelay, unwrapApiResponse } from './api'

// Map backend roles (SUPER_ADMIN / SHOP_OWNER) → frontend keys (admin / owner)
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

/**
 * Login.
 * - role === 'owner': sends { phone, pin }
 * - role === 'admin':  sends { email, password }
 */
export async function login({ role, phone, pin, email, password }) {
  if (USE_MOCK) {
    const user = {
      id: role === 'admin' ? 0 : 1,
      name: role === 'admin' ? 'المدير العام' : 'صاحب المستودع',
      role,
      phone: phone || '',
      email: email || '',
    }
    const token = `mock-token-${role}`
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    return mockDelay({ user, token })
  }

  const payload = role === 'admin'
    ? { email: email.toLowerCase().trim(), password }
    : { phone, pin }

  const { data } = await api.post('/auth/login', payload)
  const result = unwrapApiResponse(data)

  if (result.token) {
    localStorage.setItem('token', result.token)
    result.user = persistUser(result.user)
  }
  return result
}

export async function getMe() {
  if (USE_MOCK) return mockDelay(getCurrentUser())
  const { data } = await api.get('/auth/me')
  const payload = unwrapApiResponse(data)
  return persistUser(payload.user || payload)
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
