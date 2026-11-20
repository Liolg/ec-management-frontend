import { useMutation, useQueryClient } from '@tanstack/react-query'
import { entriesApi } from '../api/accounts'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/getErrorMessage'

export function useVoidEntry() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: entriesApi.void,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['entries'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] })
      showToast('Entry voided', 'success')
    },
    onError: (error) => {
      showToast(getErrorMessage(error))
    },
  })
}
