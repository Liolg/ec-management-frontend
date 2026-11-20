import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownToLine, ArrowUpFromLine, History, Pencil, Trash2 } from 'lucide-react'
import { costSheetsApi, productsApi, stockAdjustmentsApi } from '../../api/products'
import ConfirmModal from '../../components/ConfirmModal'
import EmptyState from '../../components/EmptyState'
import FormModal from '../../components/FormModal'
import PageHeader from '../../components/PageHeader'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { Product, ProductInput, StockAdjustmentInput } from '../../types/products'

const inputClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand'

function money(value: number | string | null | undefined) {
  return value == null || value === '' ? '—' : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function today() {
  const date = new Date()
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

function ProductForm({ product, onSuccess, onPendingChange }: { product: Product | null; onSuccess: () => void; onPendingChange: (pending: boolean) => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const costSheets = useQuery({ queryKey: ['cost-sheets'], queryFn: costSheetsApi.list })
  const [name, setName] = useState(product?.name ?? '')
  const [costSheetId, setCostSheetId] = useState(product ? String(product.cost_sheet.id) : '')
  const [validationError, setValidationError] = useState('')
  const mutation = useMutation({
    mutationFn: (data: ProductInput) => product ? productsApi.update(product.id, data) : productsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      showToast(`Product ${product ? 'updated' : 'created'}`, 'success')
      onSuccess()
    },
    onError: (error) => showToast(getErrorMessage(error)),
    onSettled: () => onPendingChange(false),
  })

  function submit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) setValidationError('Name is required.')
    else if (!Number(costSheetId)) setValidationError('Select a cost sheet.')
    else {
      setValidationError('')
      onPendingChange(true)
      mutation.mutate({ name: name.trim(), cost_sheet: Number(costSheetId) })
    }
  }

  return <form onSubmit={submit} className="flex flex-col gap-4">
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} className={inputClass} autoFocus /></label>
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Cost sheet<select value={costSheetId} onChange={(event) => setCostSheetId(event.target.value)} className={inputClass}><option value="">Select cost sheet…</option>{costSheets.data?.map((sheet) => <option key={sheet.id} value={sheet.id}>{sheet.name} — {money(sheet.selling_price)}</option>)}</select></label>
    {(validationError || mutation.isError || costSheets.isError) && <p className="text-sm text-red-500">{validationError || (mutation.isError ? getErrorMessage(mutation.error) : 'Failed to load cost sheets.')}</p>}
    <div className="flex justify-end"><button disabled={mutation.isPending || costSheets.isLoading} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{mutation.isPending ? 'Saving…' : 'Save product'}</button></div>
  </form>
}

function AdjustmentForm({ product, onSuccess, onPendingChange }: { product: Product; onSuccess: () => void; onPendingChange: (pending: boolean) => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN')
  const [qty, setQty] = useState('')
  const [date, setDate] = useState(today())
  const [unitCost, setUnitCost] = useState('')
  const [reference, setReference] = useState('')
  const [validationError, setValidationError] = useState('')
  const mutation = useMutation({
    mutationFn: stockAdjustmentsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock', product.id] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      showToast('Stock adjustment created', 'success')
      onSuccess()
    },
    onError: (error) => showToast(getErrorMessage(error)),
    onSettled: () => onPendingChange(false),
  })

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const numericQty = Number(qty)
    const numericUnitCost = Number(unitCost)
    if (!Number.isInteger(numericQty) || numericQty <= 0) setValidationError('Quantity must be a positive whole number.')
    else if (!date) setValidationError('Date is required.')
    else if (unitCost !== '' && (!Number.isFinite(numericUnitCost) || numericUnitCost < 0)) setValidationError('Unit cost must be zero or greater.')
    else {
      setValidationError('')
      const data: StockAdjustmentInput = {
        product: product.id,
        direction,
        qty: numericQty,
        date,
        reference: reference.trim(),
      }
      if (unitCost !== '') data.unit_cost = unitCost
      onPendingChange(true)
      mutation.mutate(data)
    }
  }

  return <form onSubmit={submit} className="flex flex-col gap-4">
    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">Adjusting <span className="font-medium">{product.name}</span></div>
    <div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Direction<select value={direction} onChange={(event) => setDirection(event.target.value as 'IN' | 'OUT')} className={inputClass}><option value="IN">Stock in</option><option value="OUT">Stock out</option></select></label><label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Quantity<input type="number" min="1" step="1" value={qty} onChange={(event) => setQty(event.target.value)} className={inputClass} autoFocus /></label></div>
    <div className="grid grid-cols-2 gap-3"><label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Date<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} /></label><label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Unit cost (optional)<input type="number" min="0" step="0.01" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} className={inputClass} /></label></div>
    <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Reference (optional)<input value={reference} onChange={(event) => setReference(event.target.value)} maxLength={64} className={inputClass} /></label>
    {(validationError || mutation.isError) && <p className="text-sm text-red-500">{validationError || getErrorMessage(mutation.error)}</p>}
    <div className="flex justify-end"><button disabled={mutation.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{mutation.isPending ? 'Saving…' : 'Create adjustment'}</button></div>
  </form>
}

function StockHistory({ product, onAdjust }: { product: Product; onAdjust: () => void }) {
  const stock = useQuery({ queryKey: ['stock', product.id], queryFn: () => productsApi.stock(product.id) })
  return <div className="flex flex-col gap-4">
    <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3"><div><span className="block text-xs text-gray-500">Current stock</span><span className="text-2xl font-semibold text-gray-900">{stock.data?.current_stock ?? '—'} <span className="text-sm font-normal text-gray-500">{product.cost_sheet.unit || 'units'}</span></span></div><button onClick={onAdjust} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">New adjustment</button></div>
    {stock.isLoading && <p className="py-6 text-center text-sm text-gray-500">Loading stock history…</p>}
    {stock.isError && <p className="py-6 text-center text-sm text-red-500">{getErrorMessage(stock.error)}</p>}
    {stock.data?.movements.length === 0 && <EmptyState message="No stock movements yet." />}
    {!!stock.data?.movements.length && <div className="max-h-96 overflow-auto rounded-lg border border-gray-200"><table className="w-full text-sm"><thead className="sticky top-0 border-b border-gray-200 bg-gray-50"><tr><th className="px-4 py-2 text-left font-medium text-gray-500">Date</th><th className="px-4 py-2 text-left font-medium text-gray-500">Direction</th><th className="px-4 py-2 text-right font-medium text-gray-500">Qty</th><th className="px-4 py-2 text-right font-medium text-gray-500">Unit cost</th><th className="px-4 py-2 text-left font-medium text-gray-500">Reference</th></tr></thead><tbody className="divide-y divide-gray-100">{stock.data.movements.map((movement) => <tr key={movement.id}><td className="px-4 py-3 text-gray-600">{movement.date}</td><td className="px-4 py-3"><span className={`inline-flex items-center gap-1 font-medium ${movement.direction === 'IN' ? 'text-green-600' : 'text-amber-600'}`}>{movement.direction === 'IN' ? <ArrowDownToLine size={13} /> : <ArrowUpFromLine size={13} />}{movement.direction === 'IN' ? 'In' : 'Out'}</span></td><td className="px-4 py-3 text-right tabular-nums">{movement.qty}</td><td className="px-4 py-3 text-right tabular-nums text-gray-600">{money(movement.unit_cost)}</td><td className="px-4 py-3 text-gray-500">{movement.reference || '—'}</td></tr>)}</tbody></table></div>}
  </div>
}

export default function Products() {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  const [stockProduct, setStockProduct] = useState<Product | null>(null)
  const [adjusting, setAdjusting] = useState<Product | null>(null)
  const [formPending, setFormPending] = useState(false)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const query = useQuery({ queryKey: ['products'], queryFn: productsApi.list })
  const deleteMutation = useMutation({ mutationFn: productsApi.delete, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); showToast('Product deleted', 'success'); setDeleting(null) }, onError: (error) => showToast(getErrorMessage(error)) })

  if (query.isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (query.isError) return <p className="p-8 text-red-500">Failed to load products.</p>

  return <div className="flex flex-col gap-6">
    <PageHeader title="Products" action={<button onClick={() => setCreating(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">New Product</button>} />
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="border-b border-gray-200 bg-gray-50"><tr><th className="px-6 py-3 text-left font-medium text-gray-500">Product</th><th className="px-6 py-3 text-left font-medium text-gray-500">Cost sheet</th><th className="px-6 py-3 text-left font-medium text-gray-500">Unit</th><th className="px-6 py-3 text-right font-medium text-gray-500">Cost</th><th className="px-6 py-3 text-right font-medium text-gray-500">Selling price</th><th className="w-28 px-6 py-3" /></tr></thead><tbody className="divide-y divide-gray-100">
      {query.data?.length === 0 && <tr><td colSpan={6}><EmptyState message="No products yet. Create a cost sheet, then add a product." /></td></tr>}
      {query.data?.map((product) => <tr key={product.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium text-gray-900">{product.name}</td><td className="px-6 py-4 text-gray-600">{product.cost_sheet.name}</td><td className="px-6 py-4 text-gray-500">{product.cost_sheet.unit || '—'}</td><td className="px-6 py-4 text-right tabular-nums text-gray-600">{money(product.cost_sheet.total_cost)}</td><td className="px-6 py-4 text-right tabular-nums text-gray-900">{money(product.cost_sheet.selling_price)}</td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => setStockProduct(product)} className="text-gray-400 hover:text-green-600" title="Stock history"><History size={15} /></button><button onClick={() => setEditing(product)} className="text-gray-400 hover:text-brand" title="Edit"><Pencil size={14} /></button><button onClick={() => setDeleting(product)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={14} /></button></div></td></tr>)}
    </tbody></table></div>
    {creating && <FormModal title="Create product" onClose={() => { if (!formPending) setCreating(false) }}><ProductForm product={null} onSuccess={() => setCreating(false)} onPendingChange={setFormPending} /></FormModal>}
    {editing && <FormModal title="Edit product" onClose={() => { if (!formPending) setEditing(null) }}><ProductForm product={editing} onSuccess={() => setEditing(null)} onPendingChange={setFormPending} /></FormModal>}
    {stockProduct && <FormModal title={`${stockProduct.name} stock`} maxWidth="max-w-3xl" onClose={() => setStockProduct(null)}><StockHistory product={stockProduct} onAdjust={() => { setAdjusting(stockProduct); setStockProduct(null) }} /></FormModal>}
    {adjusting && <FormModal title="Stock adjustment" onClose={() => { if (!formPending) setAdjusting(null) }}><AdjustmentForm product={adjusting} onSuccess={() => { const product = adjusting; setAdjusting(null); setStockProduct(product) }} onPendingChange={setFormPending} /></FormModal>}
    {deleting && <ConfirmModal title="Delete product" message={`Delete “${deleting.name}”? Its stock history will also be deleted.`} confirmLabel="Delete" danger pending={deleteMutation.isPending} error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined} onConfirm={() => deleteMutation.mutate(deleting.id)} onCancel={() => setDeleting(null)} />}
  </div>
}
