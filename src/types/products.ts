export interface DirectMaterial {
  id: string
  name: string
  unit: string
  cost_by_unit: number
}

export interface DirectMaterialInput {
  name: string
  unit: string
  cost_by_unit: number
}

export interface DirectLabor {
  id: string
  name: string
  time_unit: string
  cost_by_unit: number
}

export interface DirectLaborInput {
  name: string
  time_unit: string
  cost_by_unit: number
}

export interface CostSheetMaterial {
  id: string
  material: string
  qty: number
  total_cost: number
}

export interface CostSheetLabor {
  id: string
  labor: string
  qty: number
  total_cost: number
}

export interface CostSheet {
  id: string
  name: string
  unit: string | null
  material: CostSheetMaterial[]
  labor: CostSheetLabor[]
  manufacturing_overhead: number | null
  total_manufacturing_cost: number | null
  non_manufacturing_cost: number | null
  total_cost: number | null
  profit_margin: number | null
  selling_price: number | null
}

export interface CostSheetInput {
  name: string
  unit?: string
  manufacturing_overhead?: number | null
  non_manufacturing_cost?: number | null
  profit_margin?: number | null
}

export interface Product {
  id: string
  name: string
  cost_sheet: CostSheet
}

export interface ProductInput {
  name: string
  cost_sheet: string
}

export interface StockMovement {
  id: string
  product: string
  qty: number
  direction: 'IN' | 'OUT'
  unit_cost: string | null
  date: string
  reference: string
  created_at: string
}

export interface StockAdjustmentInput {
  product: string
  qty: number
  direction: 'IN' | 'OUT'
  unit_cost: string
  date: string
  reference?: string
}

export interface ProductStock {
  current_stock: number
  movements: StockMovement[]
}
