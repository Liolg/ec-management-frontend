import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/business'

export function useBusinessSummary(params?: { start?: string; end?: string }) {
  return useQuery({
    queryKey: ['summary', params],
    queryFn: () => reportsApi.summary(params),
  })
}
