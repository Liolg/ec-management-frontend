import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts'
import type { Account } from '../types/accounts'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/getErrorMessage'

export function useCreateAccount(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: (data: Partial<Account>) => accountsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      showToast('Account created', 'success')
      options?.onSuccess?.()
    },
    onError: (error) => {
      showToast(getErrorMessage(error))
    },
  })
}
