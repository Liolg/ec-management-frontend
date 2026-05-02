import { useQuery } from '@tanstack/react-query'
import { businessApi } from '../api/business'

export function useBusinessSummary() {
  return useQuery({
    queryKey: ['summary'],
    queryFn: () => businessApi.getSummary(),
  })
}
