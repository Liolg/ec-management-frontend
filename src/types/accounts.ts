export type AccountType = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export interface Account {
  id: string
  code: number
  name: string
  type: AccountType
  modified_at: string
}

export interface Line {
  id: string
  account: Account  // full nested object — read only
  type: 'D' | 'C'
  value: string
}

export interface Entry {
  id: string
  description: string
  date: string
  voided: boolean
  lines: Line[]
}

// Shapes for create/update — account is just the id, not the full object
export interface LineInput {
  account: string
  type: 'D' | 'C'
  value: string    // decimal string, matches Django's DecimalField
}

export interface EntryInput {
  description: string
  date: string
  lines: LineInput[]
}
