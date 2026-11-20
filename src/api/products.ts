import { client } from './client'
import type {
  CostSheet,
  CostSheetInput,
  DirectLabor,
  DirectLaborInput,
  DirectMaterial,
  DirectMaterialInput,
  Product,
  ProductInput,
  ProductWriteResult,
  ProductStock,
  StockAdjustmentInput,
  StockMovement,
} from '../types/products'

const BASE = '/api/products'

export const materialsApi = {
  list: () => client.get<DirectMaterial[]>(`${BASE}/materials/`).then((response) => response.data),
  get: (id: number) => client.get<DirectMaterial>(`${BASE}/materials/${id}/`).then((response) => response.data),
  create: (data: DirectMaterialInput) => client.post<DirectMaterial>(`${BASE}/materials/`, data).then((response) => response.data),
  update: (id: number, data: Partial<DirectMaterialInput>) => client.patch<DirectMaterial>(`${BASE}/materials/${id}/`, data).then((response) => response.data),
  delete: (id: number) => client.delete(`${BASE}/materials/${id}/`),
}

export const laborsApi = {
  list: () => client.get<DirectLabor[]>(`${BASE}/labors/`).then((response) => response.data),
  get: (id: number) => client.get<DirectLabor>(`${BASE}/labors/${id}/`).then((response) => response.data),
  create: (data: DirectLaborInput) => client.post<DirectLabor>(`${BASE}/labors/`, data).then((response) => response.data),
  update: (id: number, data: Partial<DirectLaborInput>) => client.patch<DirectLabor>(`${BASE}/labors/${id}/`, data).then((response) => response.data),
  delete: (id: number) => client.delete(`${BASE}/labors/${id}/`),
}

export const costSheetsApi = {
  list: () => client.get<CostSheet[]>(`${BASE}/costsheets/`).then((response) => response.data),
  get: (id: number) => client.get<CostSheet>(`${BASE}/costsheets/${id}/`).then((response) => response.data),
  create: (data: CostSheetInput) => client.post<CostSheet>(`${BASE}/costsheets/`, data).then((response) => response.data),
  update: (id: number, data: Partial<CostSheetInput>) => client.patch<CostSheet>(`${BASE}/costsheets/${id}/`, data).then((response) => response.data),
  delete: (id: number) => client.delete(`${BASE}/costsheets/${id}/`),
  calculate: (id: number) => client.post<CostSheet>(`${BASE}/costsheets/${id}/calculate/`).then((response) => response.data),
}

export const productsApi = {
  list: () => client.get<Product[]>(`${BASE}/products/`).then((response) => response.data),
  get: (id: number) => client.get<Product>(`${BASE}/products/${id}/`).then((response) => response.data),
  create: (data: ProductInput) => client.post<ProductWriteResult>(`${BASE}/products/`, data).then((response) => response.data),
  update: (id: number, data: Partial<ProductInput>) => client.patch<ProductWriteResult>(`${BASE}/products/${id}/`, data).then((response) => response.data),
  delete: (id: number) => client.delete(`${BASE}/products/${id}/`),
  stock: (id: number) => client.get<ProductStock>(`${BASE}/products/${id}/stock/`).then((response) => response.data),
}

export const stockAdjustmentsApi = {
  list: () => client.get<StockMovement[]>(`${BASE}/stock-adjustments/`).then((response) => response.data),
  create: (data: StockAdjustmentInput) => client.post<StockMovement>(`${BASE}/stock-adjustments/`, data).then((response) => response.data),
}
