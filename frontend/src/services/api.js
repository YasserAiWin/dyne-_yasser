import axios from 'axios'

// Base Axios instance. All services import this.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Attach auth token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response handling: surface errors, auto-logout on 401.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      // Avoid redirect loops on the login page itself.
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Toggle between mock data and real API calls via .env (VITE_USE_MOCK).
export const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true') === 'true'

// Small helper to simulate network latency for mock responses.
export const mockDelay = (data, ms = 400) =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms))

// Unwrap the backend's { success, data } envelope, if present.
export function unwrapApiResponse(responseData) {
  if (responseData && responseData.success === true && responseData.data !== undefined) {
    return responseData.data
  }
  return responseData
}

export default api
