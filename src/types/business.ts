import type { Account } from './accounts'

export interface BusinessConfig {
  company_name: string
  currency: string
  cash_account: Account
  receivable_account: Account
  payable_account: Account
  revenue_account: Account
  cogs_account: Account | null
  inventory_account: Account
  expense_account: Account
}

export interface BusinessConfigInput {
  company_name?: string
  currency?: string
  cash_account?: string
  receivable_account?: string
  payable_account?: string
  revenue_account?: string
  cogs_account?: string | null
  inventory_account?: string
  expense_account?: string
}

export type PaymentMethod = 'cash' | 'credit'
export type TransactionStatus = 'confirmed' | 'voided'

export interface Sale {
  id: string
  product: string
  product_name: string
  qty: number
  unit_price: string
  total_amount: string
  date: string
  customer_name: string
  payment_method: PaymentMethod
  status: TransactionStatus
  entry: string
  created_at: string
}

export interface SaleInput {
  product: string
  qty: number
  unit_price?: string
  date: string
  customer_name?: string
  payment_method: PaymentMethod
}

export interface Purchase {
  id: string
  product: string
  product_name: string
  qty: number
  unit_cost: string
  total_amount: string
  date: string
  supplier_name: string
  payment_method: PaymentMethod
  status: TransactionStatus
  entry: string
  created_at: string
}

export interface PurchaseInput {
  product: string
  qty: number
  unit_cost: string
  date: string
  supplier_name?: string
  payment_method: PaymentMethod
}

export type ExpenseCategory =
  | 'rent'
  | 'utilities'
  | 'salaries'
  | 'marketing'
  | 'supplies'
  | 'transport'
  | 'other'

export interface Expense {
  id: string
  description: string
  category: ExpenseCategory
  amount: string
  date: string
  payment_method: PaymentMethod
  status: TransactionStatus
  entry: string
  created_at: string
}

export interface ExpenseInput {
  description: string
  category: ExpenseCategory
  amount: string
  date: string
  payment_method: PaymentMethod
}

export interface Payment {
  id: string
  direction: 'received' | 'made'
  amount: string
  date: string
  counterparty_name: string
  related_sale: string | null
  related_purchase: string | null
  status: TransactionStatus
  entry: string
  created_at: string
}

export interface PaymentInput {
  direction: 'received' | 'made'
  amount: string
  date: string
  counterparty_name?: string
  related_sale?: string | null
  related_purchase?: string | null
}

export interface SummaryReport {
  period: { start: string | null; end: string | null }
  revenue: string
  expenses: string
  net_profit: string
  cash_balance: string
  receivables: string
  payables: string
}

export interface ProfitLossItem {
  account: string
  amount: string
}

export interface ProfitLossReport {
  period: { start: string | null; end: string | null }
  revenue: ProfitLossItem[]
  total_revenue: string
  expenses: ProfitLossItem[]
  total_expenses: string
  net_profit: string
}

export interface InventoryReportItem {
  product: string
  current_stock: number
  unit_cost: string
  stock_value: string
}
