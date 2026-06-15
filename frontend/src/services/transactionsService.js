import api, { USE_MOCK, mockDelay, unwrapApiResponse } from './api'
import { transactions, recentTransactions } from '../data/mockData'

// Normalize a transactions payload that may be an array or { transactions: [...] }.
function toTransactionsArray(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.transactions)) return payload.transactions
  return []
}

export async function getCustomerTransactions(customerId) {
  if (USE_MOCK) return mockDelay([...(transactions[customerId] || [])])
  const { data } = await api.get(`/shop/customers/${customerId}/transactions`)
  return toTransactionsArray(unwrapApiResponse(data))
}

// No dedicated endpoint in the backend contract yet — mock data only.
export async function getRecentTransactions() {
  if (USE_MOCK) return mockDelay([...recentTransactions])
  return []
}

export async function addDebt(customerId, { amount, note }) {
  if (USE_MOCK) {
    return mockDelay({
      id: Date.now(),
      type: 'debt',
      amount: Number(amount),
      note,
      date: new Date().toISOString().slice(0, 10),
    })
  }
  const { data } = await api.post(`/shop/customers/${customerId}/debts`, {
    amount: Number(amount),
    note,
  })
  const payload = unwrapApiResponse(data)
  return payload?.transaction ?? payload
}

export async function addPayment(customerId, { amount, note }) {
  if (USE_MOCK) {
    return mockDelay({
      id: Date.now(),
      type: 'payment',
      amount: Number(amount),
      note,
      date: new Date().toISOString().slice(0, 10),
    })
  }
  const { data } = await api.post(`/shop/customers/${customerId}/payments`, {
    amount: Number(amount),
    note,
  })
  const payload = unwrapApiResponse(data)
  return payload?.transaction ?? payload
}
