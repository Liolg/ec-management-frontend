import { client } from './client'
import type { Account, Entry, EntryInput } from '../types/accounts'

const BASE = '/api/accounting'

export const accountsApi = {
  list: () => client.get<Account[]>(`${BASE}/accounts/`).then((r) => r.data),
  get: (id: string) => client.get<Account>(`${BASE}/accounts/${id}/`).then((r) => r.data),
  create: (data: Partial<Account>) => client.post<Account>(`${BASE}/accounts/`, data).then((r) => r.data),
  update: (id: string, data: Partial<Account>) => client.patch<Account>(`${BASE}/accounts/${id}/`, data).then((r) => r.data),
  delete: (id: string) => client.delete(`${BASE}/accounts/${id}/`),
}

export const entriesApi = {
  list: () => client.get<Entry[]>(`${BASE}/entries/`).then((r) => r.data),
  get: (id: string) => client.get<Entry>(`${BASE}/entries/${id}/`).then((r) => r.data),
  create: (data: EntryInput) => client.post<Entry>(`${BASE}/entries/`, data).then((r) => r.data),
  update: (id: string, data: Partial<EntryInput>) => client.patch<Entry>(`${BASE}/entries/${id}/`, data).then((r) => r.data),
  delete: (id: string) => client.delete(`${BASE}/entries/${id}/`),
  void: (id: string) => client.post<{ status: string }>(`${BASE}/entries/${id}/void/`).then((r) => r.data),
}
