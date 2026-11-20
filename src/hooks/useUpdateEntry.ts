import { useMutation, useQueryClient } from '@tanstack/react-query'
import { entriesApi } from '../api/accounts'
import type { EntryInput } from '../types/accounts'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/getErrorMessage'

export function useUpdateEntry(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<EntryInput> }) => entriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] })
      showToast('Entry updated', 'success')
      options?.onSuccess?.()
    },
    onError: (error) => {
      showToast(getErrorMessage(error))
    },
  })
}
