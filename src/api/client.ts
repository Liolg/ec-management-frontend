import axios, { type InternalAxiosRequestConfig } from 'axios'
import { API_URL, clearSession, refreshAccessToken } from './auth'

interface SessionRequest extends InternalAxiosRequestConfig {
  sessionToken?: string | null
  retried?: boolean
}

let pendingRefresh: { token: string; promise: Promise<void> } | undefined

function refreshOnce(token: string) {
  if (pendingRefresh?.token === token) return pendingRefresh.promise

  const promise = refreshAccessToken(token)
    .then((access) => {
      if (localStorage.getItem('refresh_token') === token) {
        localStorage.setItem('access_token', access)
      }
    })
    .finally(() => {
      if (pendingRefresh?.promise === promise) pendingRefresh = undefined
    })

  pendingRefresh = { token, promise }
  return promise
}

export const client = axios.create({ baseURL: API_URL })

client.interceptors.request.use((config: SessionRequest) => {
  const sessionToken = localStorage.getItem('refresh_token')
  if (config.retried && config.sessionToken !== sessionToken) {
    throw new axios.CanceledError('Session changed')
  }
  config.sessionToken = sessionToken

  const access = localStorage.getItem('access_token')
  if (access) config.headers.set('Authorization', `Bearer ${access}`)
  return config
})

client.interceptors.response.use(undefined, async (error: unknown) => {
  if (!axios.isAxiosError(error)) throw error

  const request: SessionRequest | undefined = error.config
  const token = localStorage.getItem('refresh_token')
  if (error.response?.status !== 401 || !request || request.sessionToken !== token) throw error

  if (!token || request.retried) {
    clearSession()
    throw error
  }

  request.retried = true
  const currentAccess = localStorage.getItem('access_token')
  // A previous request may have already refreshed the access token that failed here.
  if (!currentAccess || request.headers.get('Authorization') === `Bearer ${currentAccess}`) {
    try {
      await refreshOnce(token)
    } catch {
      if (localStorage.getItem('refresh_token') === token) clearSession()
      throw error
    }
  }

  return client(request)
})
