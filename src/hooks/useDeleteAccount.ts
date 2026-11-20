import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/getErrorMessage'

export function useDeleteAccount() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: accountsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      showToast('Account deleted', 'success')
    },
    onError: (error) => {
      showToast(getErrorMessage(error))
    },
  })
}
