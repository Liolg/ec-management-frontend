import { useQuery } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { setupApi } from '../api/business'

export function useBusinessConfig() {
  return useQuery({
    queryKey: ['business-config'],
    queryFn: async () => {
      try {
        return await setupApi.get()
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 404) return null
        throw error
      }
    },
  })
}
