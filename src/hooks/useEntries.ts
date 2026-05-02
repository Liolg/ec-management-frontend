import { useQuery } from '@tanstack/react-query'
import { entriesApi } from '../api/accounts'

export function useEntries() {
  return useQuery({
    queryKey: ['entries'],
    queryFn: entriesApi.list,
  })
}
