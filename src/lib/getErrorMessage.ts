import { AxiosError } from 'axios'

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data
    if (typeof data === 'string') return data
    if (data?.detail) return String(data.detail)
    if (data?.message) return String(data.message)
    if (error.message) return error.message
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
