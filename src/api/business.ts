import { client } from './client'
import type { BusinessConfig, SummaryReport } from '../types/business'

const BASE = '/api/business'

export const businessApi = {
  getConfig: () => client.get<BusinessConfig>(`${BASE}/setup/`).then((r) => r.data),
  getSummary: (params?: { start?: string; end?: string }) =>
    client.get<SummaryReport>(`${BASE}/reports/summary/`, { params }).then((r) => r.data),
}
