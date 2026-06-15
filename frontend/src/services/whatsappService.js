import api, { USE_MOCK, mockDelay, unwrapApiResponse } from './api'

const defaultSettings = {
  enabled: false,
  phoneNumber: '',
  reminderMessage: '',
}

export async function getWhatsAppSettings() {
  if (USE_MOCK) return mockDelay({ ...defaultSettings })
  const { data } = await api.get('/shop/whatsapp/settings')
  return unwrapApiResponse(data)
}

export async function updateWhatsAppSettings(payload) {
  if (USE_MOCK) return mockDelay({ ...defaultSettings, ...payload })
  const { data } = await api.put('/shop/whatsapp/settings', payload)
  return unwrapApiResponse(data)
}
