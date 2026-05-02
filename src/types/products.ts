export interface DirectMaterial {
  id: string
  name: string
  unit_cost: string
}

export interface DirectLabor {
  id: string
  name: string
  hourly_rate: string
}

export interface CostSheet {
  id: string
  name: string
  material: string
  labor: string
  manufacturing_overhead: string
  selling_price: string
}

export interface Product {
  id: string
  name: string
  cost_sheet: CostSheet | null
  current_stock: number
}

export interface StockMovement {
  id: string
  product: string
  direction: 'IN' | 'OUT'
  quantity: number
  date: string
  note: string
}
