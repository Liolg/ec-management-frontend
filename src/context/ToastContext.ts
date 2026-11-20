import { createContext, useContext } from 'react'

interface ToastContextValue {
  showToast: (message: string, type?: 'success' | 'error') => void
}

export const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
