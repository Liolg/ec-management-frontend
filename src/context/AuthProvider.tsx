import { useEffect, useState, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { clearSession, login, SESSION_ENDED } from '../api/auth'
import { AuthContext } from './AuthContext'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem('access_token') || localStorage.getItem('refresh_token')),
  )

  useEffect(() => {
    function endSession() {
      queryClient.clear()
      setIsAuthenticated(false)
    }

    function syncSession(event: StorageEvent) {
      if (event.storageArea !== localStorage || (event.key !== 'refresh_token' && event.key !== null)) return
      queryClient.clear()
      setIsAuthenticated(Boolean(localStorage.getItem('refresh_token')))
    }

    window.addEventListener(SESSION_ENDED, endSession)
    window.addEventListener('storage', syncSession)
    return () => {
      window.removeEventListener(SESSION_ENDED, endSession)
      window.removeEventListener('storage', syncSession)
    }
  }, [queryClient])

  async function signIn(username: string, password: string) {
    const tokens = await login(username, password)
    queryClient.clear()
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut: clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}
