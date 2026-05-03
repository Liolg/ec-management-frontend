export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense'

export interface Account {
  id: string
  code: number
  name: string
  type: AccountType
  modified_at: string
}

export interface Line {
  id: string
  account: Account
  description: string
  type: 'D' | 'C'
  value: string
}

export interface Entry {
  id: string
  description: string
  date: string
  reference: string
  voided: boolean
  lines: Line[]
}

export interface LineInput {
  id?: string
  account: string
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
