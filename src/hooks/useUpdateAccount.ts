import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountsApi } from '../api/accounts'
import type { AccountInput } from '../types/accounts'
import { useToast } from '../context/ToastContext'
import { getErrorMessage } from '../lib/getErrorMessage'

export function useUpdateAccount(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AccountInput> }) => accountsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['business-config'] })
      queryClient.invalidateQueries({ queryKey: ['summary'] })
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] })
      showToast('Account updated', 'success')
      options?.onSuccess?.()
    },
    onError: (error) => {
      showToast(getErrorMessage(error))
    },
  })
}
