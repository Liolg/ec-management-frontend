export interface BusinessConfig {
  id: string
  name: string
  currency: string
  cash_account: import('./accounts').Account
  receivable_account: import('./accounts').Account
  payable_account: import('./accounts').Account
  revenue_account: import('./accounts').Account
  inventory_account: import('./accounts').Account
  expense_account: import('./accounts').Account
}

export interface Sale {
  id: string
  entry: string
  product: string
  quantity: number
  unit_price: string
  payment_method: 'cash' | 'credit'
  date: string
  voided: boolean
}

export interface SummaryReport {
  revenue: string
  expenses: string
  net_profit: string
  cash_balance: string
  receivable_balance: string
  payable_balance: string
}
