import { createContext, useContext } from 'react'

interface AuthContextValue {
  isAuthenticated: boolean
  signIn: (username: string, password: string) => Promise<void>
  signOut: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return context
}
