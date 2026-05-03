import { client } from './client'
import type {
  BusinessConfig,
  BusinessConfigInput,
  Sale,
  SaleInput,
  Purchase,
  PurchaseInput,
  Expense,
  ExpenseInput,
  Payment,
  PaymentInput,
  SummaryReport,
  ProfitLossReport,
  InventoryReportItem,
} from '../types/business'

const BASE = '/api/business'

export const setupApi = {
  get: () => client.get<BusinessConfig>(`${BASE}/setup/`).then((r) => r.data),
  create: (data: { company_name: string; currency?: string }) =>
    client.post<BusinessConfig>(`${BASE}/setup/`, data).then((r) => r.data),
  update: (data: BusinessConfigInput) =>
    client.patch<BusinessConfig>(`${BASE}/setup/`, data).then((r) => r.data),
}

export const salesApi = {
  list: () => client.get<Sale[]>(`${BASE}/sales/`).then((r) => r.data),
  get: (id: string) => client.get<Sale>(`${BASE}/sales/${id}/`).then((r) => r.data),
  create: (data: SaleInput) => client.post<Sale>(`${BASE}/sales/`, data).then((r) => r.data),
  void: (id: string) => client.post<Sale>(`${BASE}/sales/${id}/void/`).then((r) => r.data),
}

export const purchasesApi = {
  list: () => client.get<Purchase[]>(`${BASE}/purchases/`).then((r) => r.data),
  get: (id: string) => client.get<Purchase>(`${BASE}/purchases/${id}/`).then((r) => r.data),
  create: (data: PurchaseInput) => client.post<Purchase>(`${BASE}/purchases/`, data).then((r) => r.data),
  void: (id: string) => client.post<Purchase>(`${BASE}/purchases/${id}/void/`).then((r) => r.data),
}

export const expensesApi = {
  list: () => client.get<Expense[]>(`${BASE}/expenses/`).then((r) => r.data),
  get: (id: string) => client.get<Expense>(`${BASE}/expenses/${id}/`).then((r) => r.data),
  create: (data: ExpenseInput) => client.post<Expense>(`${BASE}/expenses/`, data).then((r) => r.data),
  void: (id: string) => client.post<Expense>(`${BASE}/expenses/${id}/void/`).then((r) => r.data),
}

export const paymentsApi = {
  list: () => client.get<Payment[]>(`${BASE}/payments/`).then((r) => r.data),
  get: (id: string) => client.get<Payment>(`${BASE}/payments/${id}/`).then((r) => r.data),
  create: (data: PaymentInput) => client.post<Payment>(`${BASE}/payments/`, data).then((r) => r.data),
  void: (id: string) => client.post<Payment>(`${BASE}/payments/${id}/void/`).then((r) => r.data),
}

export const reportsApi = {
  summary: (params?: { start?: string; end?: string }) =>
    client.get<SummaryReport>(`${BASE}/reports/summary/`, { params }).then((r) => r.data),
  profitLoss: (params?: { start?: string; end?: string }) =>
    client.get<ProfitLossReport>(`${BASE}/reports/profit-loss/`, { params }).then((r) => r.data),
  inventory: () =>
    client.get<InventoryReportItem[]>(`${BASE}/reports/inventory/`).then((r) => r.data),
}

// keep backward-compat export used by existing hooks
export const businessApi = {
  getConfig: () => setupApi.get(),
  getSummary: (params?: { start?: string; end?: string }) => reportsApi.summary(params),
}
