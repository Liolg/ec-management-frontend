import { AxiosError } from 'axios'

function validationMessages(data: unknown, field?: string): string[] {
  if (typeof data === 'string') return field ? [`${field}: ${data}`] : [data]
  if (Array.isArray(data)) return data.flatMap((value) => validationMessages(value, field))
  if (data && typeof data === 'object') {
    return Object.entries(data).flatMap(([key, value]) => {
      const label = ['detail', 'message', 'non_field_errors'].includes(key)
        ? field
        : key.replaceAll('_', ' ')
      return validationMessages(value, label)
    })
  }
  return []
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data: unknown = error.response?.data
    if (typeof data !== 'string' || !data.trimStart().startsWith('<')) {
      const messages = validationMessages(data)
      if (messages.length) return messages.join(' · ')
    }
  }
  if (error instanceof Error) return error.message
  return 'Something went wrong'
}
