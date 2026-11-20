import { client } from './client'
import type { Account, AccountInput, Entry, EntryInput } from '../types/accounts'

const BASE = '/api/accounting'

export const accountsApi = {
  list: () => client.get<Account[]>(`${BASE}/accounts/`).then((r) => r.data),
  get: (id: number) => client.get<Account>(`${BASE}/accounts/${id}/`).then((r) => r.data),
  create: (data: AccountInput) => client.post<Account>(`${BASE}/accounts/`, data).then((r) => r.data),
  update: (id: number, data: Partial<AccountInput>) => client.patch<Account>(`${BASE}/accounts/${id}/`, data).then((r) => r.data),
  delete: (id: number) => client.delete(`${BASE}/accounts/${id}/`),
}

export const entriesApi = {
  list: () => client.get<Entry[]>(`${BASE}/entries/`).then((r) => r.data),
  get: (id: number) => client.get<Entry>(`${BASE}/entries/${id}/`).then((r) => r.data),
  create: (data: EntryInput) => client.post<Entry>(`${BASE}/entries/`, data).then((r) => r.data),
  update: (id: number, data: Partial<EntryInput>) => client.patch<Entry>(`${BASE}/entries/${id}/`, data).then((r) => r.data),
  delete: (id: number) => client.delete(`${BASE}/entries/${id}/`),
  void: (id: number) => client.post<{ status: string }>(`${BASE}/entries/${id}/void/`).then((r) => r.data),
}
