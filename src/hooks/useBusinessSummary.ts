import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/business'
import type { ReportPeriod } from '../types/business'

export function useBusinessSummary(params?: ReportPeriod) {
  return useQuery({
    queryKey: ['summary', params],
    queryFn: () => reportsApi.summary(params),
  })
}
