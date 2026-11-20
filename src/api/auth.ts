import axios from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
export const SESSION_ENDED = 'ec-management:session-ended'

interface TokenPair {
  access: string
  refresh: string
}

export async function login(username: string, password: string): Promise<TokenPair> {
  const { data } = await axios.post<TokenPair>(`${API_URL}/api/auth/token/`, { username, password })
  return data
}

export async function refreshAccessToken(refresh: string): Promise<string> {
  const { data } = await axios.post<Pick<TokenPair, 'access'>>(`${API_URL}/api/auth/token/refresh/`, { refresh })
  return data.access
}

export function clearSession() {
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
  window.dispatchEvent(new Event(SESSION_ENDED))
}
