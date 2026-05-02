import { useMutation, useQueryClient } from '@tanstack/react-query'
import { entriesApi } from '../api/accounts'
import type { EntryInput } from '../types/accounts'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/getErrorMessage'

export function useCreateEntry(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: EntryInput) => entriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      showToast('Entry saved', 'success')
      options?.onSuccess?.()
    },
    onError: (error) => {
      showToast(getErrorMessage(error))
    },
  })
}
