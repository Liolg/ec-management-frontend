import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { purchasesApi } from '../../api/business'
import { productsApi } from '../../api/products'
import EmptyState from '../../components/EmptyState'
import FormModal from '../../components/FormModal'
import PageHeader from '../../components/PageHeader'
import { useToast } from '../../context/ToastContext'
import { useBusinessConfig } from '../../hooks/useBusinessConfig'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { Purchase, PurchaseInput } from '../../types/business'
import type { Product } from '../../types/products'
import {
  DetailItem,
  MutationError,
  QueryError,
  SetupRequired,
  StatusBadge,
  VoidDialog,
} from './shared'
import {
  amountLabel,
  inputClass,
  labelClass,
  primaryButtonClass,
  today,
  useTransactionDetailId,
} from './utils'

const emptyForm = (): PurchaseInput => ({
  product: 0,
  qty: 1,
  unit_cost: '',
  date: today(),
  supplier_name: '',
  payment_method: 'cash',
})

export default function Purchases() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: config } = useBusinessConfig()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useTransactionDetailId()
  const [voiding, setVoiding] = useState<Purchase | null>(null)
  const [form, setForm] = useState<PurchaseInput>(emptyForm)

  const purchasesQuery = useQuery({ queryKey: ['purchases'], queryFn: purchasesApi.list })
  const productsQuery = useQuery<Product[]>({ queryKey: ['products'], queryFn: productsApi.list, enabled: showCreate })
  const detailQuery = useQuery({
    queryKey: ['purchase', selectedId],
    queryFn: () => purchasesApi.get(selectedId as number),
    enabled: selectedId !== null,
  })

  const invalidate = () => {
    for (const queryKey of [
      ['purchases'], ['entries'], ['summary'], ['profit-loss'], ['stock'], ['inventory'],
    ]) queryClient.invalidateQueries({ queryKey })
  }

  const createMutation = useMutation({
    mutationFn: purchasesApi.create,
    onSuccess: () => {
      invalidate()
      setShowCreate(false)
      setForm(emptyForm())
      showToast('Purchase recorded', 'success')
    },
    onError: (error) => showToast(getErrorMessage(error)),
  })
  const voidMutation = useMutation({
    mutationFn: purchasesApi.void,
    onSuccess: (purchase) => {
      invalidate()
      queryClient.setQueryData(['purchase', purchase.id], purchase)
      setVoiding(null)
      showToast('Purchase voided', 'success')
    },
    onError: (error) => showToast(getErrorMessage(error)),
  })

  function openCreate() {
    createMutation.reset()
    setForm(emptyForm())
    setShowCreate(true)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    createMutation.mutate(form)
  }

  if (purchasesQuery.isLoading) return <p className="p-8 text-gray-500">Loading purchases…</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Purchases" action={
        config === null
          ? <Link to="/setup" className={primaryButtonClass}>Complete setup</Link>
          : <button type="button" onClick={openCreate} disabled={!config} className={primaryButtonClass}>New Purchase</button>
      } />
      {config === null && <SetupRequired />}
      {purchasesQuery.isError && <QueryError message={getErrorMessage(purchasesQuery.error)} onRetry={() => purchasesQuery.refetch()} />}

      {!purchasesQuery.isError && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500"><tr>
              <th className="px-6 py-3 font-medium">Date</th><th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 text-right font-medium">Qty</th><th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 font-medium">Payment</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3" />
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {purchasesQuery.data?.length === 0 && <tr><td colSpan={7}><EmptyState message="No purchases yet." /></td></tr>}
              {purchasesQuery.data?.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">{purchase.date}</td><td className="px-6 py-4 text-gray-900">{purchase.product_name}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{purchase.qty}</td>
                  <td className="px-6 py-4 text-right font-medium text-gray-900">{amountLabel(purchase.total_amount, config?.currency)}</td>
                  <td className="px-6 py-4 capitalize text-gray-500">{purchase.payment_method}</td><td className="px-6 py-4"><StatusBadge status={purchase.status} /></td>
                  <td className="px-6 py-4"><div className="flex justify-end gap-3">
                    <button type="button" onClick={() => setSelectedId(purchase.id)} title="View purchase" className="text-gray-400 hover:text-brand"><Eye size={16} /></button>
                    {purchase.status !== 'voided' && <button type="button" onClick={() => { voidMutation.reset(); setVoiding(purchase) }} title="Void purchase" className="text-gray-400 hover:text-red-600"><Ban size={16} /></button>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && <FormModal title="Record purchase" onClose={createMutation.isPending ? () => undefined : () => setShowCreate(false)}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          {productsQuery.isError && <QueryError message={getErrorMessage(productsQuery.error)} onRetry={() => productsQuery.refetch()} />}
          {!productsQuery.isError && productsQuery.data?.length === 0 && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">Add a <Link to="/products" className="font-medium underline">product</Link> before recording a purchase.</p>}
          <label className={labelClass}>Product<select required value={form.product || ''} onChange={(event) => setForm({ ...form, product: Number(event.target.value) })} className={inputClass}>
            <option value="">Select a product…</option>{productsQuery.data?.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Quantity<input required min="1" step="1" type="number" value={form.qty} onChange={(event) => setForm({ ...form, qty: Number(event.target.value) })} className={inputClass} /></label>
            <label className={labelClass}>Unit cost<input required min="0.01" step="0.01" type="number" value={form.unit_cost} onChange={(event) => setForm({ ...form, unit_cost: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Payment method<select value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value as PurchaseInput['payment_method'] })} className={inputClass}>
              <option value="cash">Cash</option><option value="credit">Credit / invoice</option>
            </select></label>
          </div>
          <label className={labelClass}>Supplier (optional)<input maxLength={100} value={form.supplier_name ?? ''} onChange={(event) => setForm({ ...form, supplier_name: event.target.value })} className={inputClass} /></label>
          <MutationError error={createMutation.error} />
          <div className="flex justify-end"><button disabled={createMutation.isPending || productsQuery.data?.length === 0} className={primaryButtonClass}>{createMutation.isPending ? 'Recording…' : 'Record purchase'}</button></div>
        </form>
      </FormModal>}

      {selectedId !== null && <FormModal title={`Purchase #${selectedId}`} onClose={() => setSelectedId(null)}>
        {detailQuery.isLoading && <p className="text-sm text-gray-500">Loading details…</p>}
        {detailQuery.isError && <QueryError message={getErrorMessage(detailQuery.error)} onRetry={() => detailQuery.refetch()} />}
        {detailQuery.data && <dl className="grid grid-cols-2 gap-5">
          <DetailItem label="Status"><StatusBadge status={detailQuery.data.status} /></DetailItem><DetailItem label="Date">{detailQuery.data.date}</DetailItem>
          <DetailItem label="Product">{detailQuery.data.product_name}</DetailItem><DetailItem label="Quantity">{detailQuery.data.qty}</DetailItem>
          <DetailItem label="Unit cost">{amountLabel(detailQuery.data.unit_cost, config?.currency)}</DetailItem><DetailItem label="Total">{amountLabel(detailQuery.data.total_amount, config?.currency)}</DetailItem>
          <DetailItem label="Supplier">{detailQuery.data.supplier_name}</DetailItem><DetailItem label="Payment">{detailQuery.data.payment_method}</DetailItem>
          <DetailItem label="Journal entry">#{detailQuery.data.entry}</DetailItem>
        </dl>}
      </FormModal>}

      {voiding && <VoidDialog label={`purchase #${voiding.id}`} pending={voidMutation.isPending} error={voidMutation.error} onConfirm={() => voidMutation.mutate(voiding.id)} onCancel={() => setVoiding(null)} />}
    </div>
  )
}
