export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export interface AccountInput {
  code: string
  name: string
  type: AccountType
}

export interface Account extends AccountInput {
  id: number
}

export interface EntrySource {
  type: 'sale' | 'purchase' | 'expense' | 'payment'
  id: number
}

export interface Line {
  id: number
  account: number
  description: string
  type: 'D' | 'C'
  value: string
}

export interface Entry {
  id: number
  description: string
  date: string
  reference: string | null
  voided: boolean
  lines: Line[]
  source?: EntrySource | null
}

export interface LineInput {
  id?: number
  account: number
  description?: string
  type: 'D' | 'C'
  value: string
}

export interface EntryInput {
  description: string
  date: string
  reference?: string
  lines: LineInput[]
}
