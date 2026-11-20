export interface DirectMaterial {
  id: number
  name: string
  unit: string
  cost_by_unit: number
}

export type DirectMaterialInput = Omit<DirectMaterial, 'id'>

export interface DirectLabor {
  id: number
  name: string
  time_unit: string
  cost_by_unit: number
}

export type DirectLaborInput = Omit<DirectLabor, 'id'>

export interface CostSheetMaterialLine {
  id: number
  material: number
  qty: number
  total_cost: number
}

export interface CostSheetLaborLine {
  id: number
  labor: number
  qty: number
  total_cost: number
}

export interface CostSheetMaterialLineInput {
  material: number
  qty: number
}

export interface CostSheetLaborLineInput {
  labor: number
  qty: number
}

export interface CostSheet {
  id: number
  name: string
  unit: string | null
  material_lines: CostSheetMaterialLine[]
  labor_lines: CostSheetLaborLine[]
  manufacturing_overhead: number | null
  total_manufacturing_cost: number | null
  non_manufacturing_cost: number | null
  total_cost: number | null
  profit_margin: number | null
  selling_price: number | null
}

export interface CostSheetInput {
  name: string
  unit?: string | null
  material_lines: CostSheetMaterialLineInput[]
  labor_lines: CostSheetLaborLineInput[]
  manufacturing_overhead?: number | null
  non_manufacturing_cost?: number | null
  profit_margin?: number | null
}

export interface Product {
  id: number
  name: string
  cost_sheet: CostSheet
}

export interface ProductInput {
  name: string
  cost_sheet: number
}

export interface ProductWriteResult extends ProductInput {
  id: number
}

export type StockDirection = 'IN' | 'OUT'

export interface StockMovement {
  id: number
  product: number
  qty: number
  direction: StockDirection
  unit_cost: string | null
  date: string
  reference: string
  created_at: string
}

export interface StockAdjustmentInput {
  product: number
  qty: number
  direction: StockDirection
  unit_cost?: string | null
  date: string
  reference?: string
}

export interface ProductStock {
  current_stock: number
  movements: StockMovement[]
}
