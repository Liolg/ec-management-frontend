import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDownLeft, ArrowUpRight, Ban, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { paymentsApi, purchasesApi, salesApi } from '../../api/business'
import EmptyState from '../../components/EmptyState'
import FormModal from '../../components/FormModal'
import PageHeader from '../../components/PageHeader'
import { useToast } from '../../context/ToastContext'
import { useBusinessConfig } from '../../hooks/useBusinessConfig'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { Payment, PaymentInput } from '../../types/business'
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

const emptyForm = (): PaymentInput => ({
  direction: 'received',
  amount: '',
  date: today(),
  counterparty_name: '',
  related_sale: null,
  related_purchase: null,
})

export default function Payments() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: config } = useBusinessConfig()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useTransactionDetailId()
  const [voiding, setVoiding] = useState<Payment | null>(null)
  const [form, setForm] = useState<PaymentInput>(emptyForm)

  const paymentsQuery = useQuery({ queryKey: ['payments'], queryFn: paymentsApi.list })
  const salesQuery = useQuery({ queryKey: ['sales'], queryFn: salesApi.list, enabled: showCreate })
  const purchasesQuery = useQuery({ queryKey: ['purchases'], queryFn: purchasesApi.list, enabled: showCreate })
  const detailQuery = useQuery({
    queryKey: ['payment', selectedId],
    queryFn: () => paymentsApi.get(selectedId as number),
    enabled: selectedId !== null,
  })

  const invalidate = () => {
    for (const queryKey of [['payments'], ['entries'], ['summary'], ['profit-loss']]) {
      queryClient.invalidateQueries({ queryKey })
    }
  }

  const createMutation = useMutation({
    mutationFn: paymentsApi.create,
    onSuccess: () => {
      invalidate()
      setShowCreate(false)
      setForm(emptyForm())
      showToast('Payment recorded', 'success')
    },
    onError: (error) => showToast(getErrorMessage(error)),
  })
  const voidMutation = useMutation({
    mutationFn: paymentsApi.void,
    onSuccess: (payment) => {
      invalidate()
      queryClient.setQueryData(['payment', payment.id], payment)
      setVoiding(null)
      showToast('Payment voided', 'success')
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

  function setDirection(direction: PaymentInput['direction']) {
    setForm({ ...form, direction, related_sale: null, related_purchase: null })
  }

  if (paymentsQuery.isLoading) return <p className="p-8 text-gray-500">Loading payments…</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Payments" action={
        config === null
          ? <Link to="/setup" className={primaryButtonClass}>Complete setup</Link>
          : <button type="button" onClick={openCreate} disabled={!config} className={primaryButtonClass}>New Payment</button>
      } />
      {config === null && <SetupRequired />}
      {paymentsQuery.isError && <QueryError message={getErrorMessage(paymentsQuery.error)} onRetry={() => paymentsQuery.refetch()} />}

      {!paymentsQuery.isError && <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500"><tr>
            <th className="px-6 py-3 font-medium">Date</th><th className="px-6 py-3 font-medium">Direction</th>
            <th className="px-6 py-3 font-medium">Counterparty</th><th className="px-6 py-3 text-right font-medium">Amount</th>
            <th className="px-6 py-3 font-medium">Related transaction</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3" />
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {paymentsQuery.data?.length === 0 && <tr><td colSpan={7}><EmptyState message="No payments yet." /></td></tr>}
            {paymentsQuery.data?.map((payment) => <tr key={payment.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-500">{payment.date}</td>
              <td className="px-6 py-4"><span className="inline-flex items-center gap-2 text-gray-700">
                {payment.direction === 'received' ? <ArrowDownLeft size={15} className="text-green-600" /> : <ArrowUpRight size={15} className="text-amber-600" />}
                {payment.direction === 'received' ? 'Received' : 'Made'}
              </span></td>
              <td className="px-6 py-4 text-gray-900">{payment.counterparty_name || '—'}</td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">{amountLabel(payment.amount, config?.currency)}</td>
              <td className="px-6 py-4 text-gray-500">{payment.related_sale ? `Sale #${payment.related_sale}` : payment.related_purchase ? `Purchase #${payment.related_purchase}` : '—'}</td>
              <td className="px-6 py-4"><StatusBadge status={payment.status} /></td>
              <td className="px-6 py-4"><div className="flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedId(payment.id)} title="View payment" className="text-gray-400 hover:text-brand"><Eye size={16} /></button>
                {payment.status !== 'voided' && <button type="button" onClick={() => { voidMutation.reset(); setVoiding(payment) }} title="Void payment" className="text-gray-400 hover:text-red-600"><Ban size={16} /></button>}
              </div></td>
            </tr>)}
          </tbody>
        </table>
      </div>}

      {showCreate && <FormModal title="Record payment" onClose={createMutation.isPending ? () => undefined : () => setShowCreate(false)}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Direction<select value={form.direction} onChange={(event) => setDirection(event.target.value as PaymentInput['direction'])} className={inputClass}>
              <option value="received">Received from customer</option><option value="made">Made to supplier</option>
            </select></label>
            <label className={labelClass}>Amount<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>{form.direction === 'received' ? 'Customer' : 'Supplier'} (optional)
              <input maxLength={100} value={form.counterparty_name ?? ''} onChange={(event) => setForm({ ...form, counterparty_name: event.target.value })} className={inputClass} />
            </label>
          </div>

          {form.direction === 'received' ? <label className={labelClass}>Related sale (optional)
            <select value={form.related_sale ?? ''} onChange={(event) => setForm({ ...form, related_sale: event.target.value ? Number(event.target.value) : null })} className={inputClass}>
              <option value="">No linked sale</option>
              {salesQuery.data?.filter((sale) => sale.status === 'confirmed').map((sale) => <option key={sale.id} value={sale.id}>Sale #{sale.id} — {sale.product_name} — {sale.total_amount} ({sale.payment_method})</option>)}
            </select>
          </label> : <label className={labelClass}>Related purchase (optional)
            <select value={form.related_purchase ?? ''} onChange={(event) => setForm({ ...form, related_purchase: event.target.value ? Number(event.target.value) : null })} className={inputClass}>
              <option value="">No linked purchase</option>
              {purchasesQuery.data?.filter((purchase) => purchase.status === 'confirmed').map((purchase) => <option key={purchase.id} value={purchase.id}>Purchase #{purchase.id} — {purchase.product_name} — {purchase.total_amount} ({purchase.payment_method})</option>)}
            </select>
          </label>}

          {form.direction === 'received' && salesQuery.isError && <QueryError message={getErrorMessage(salesQuery.error)} onRetry={() => salesQuery.refetch()} />}
          {form.direction === 'made' && purchasesQuery.isError && <QueryError message={getErrorMessage(purchasesQuery.error)} onRetry={() => purchasesQuery.refetch()} />}
          <MutationError error={createMutation.error} />
          <div className="flex justify-end"><button disabled={createMutation.isPending} className={primaryButtonClass}>{createMutation.isPending ? 'Recording…' : 'Record payment'}</button></div>
        </form>
      </FormModal>}

      {selectedId !== null && <FormModal title={`Payment #${selectedId}`} onClose={() => setSelectedId(null)}>
        {detailQuery.isLoading && <p className="text-sm text-gray-500">Loading details…</p>}
        {detailQuery.isError && <QueryError message={getErrorMessage(detailQuery.error)} onRetry={() => detailQuery.refetch()} />}
        {detailQuery.data && <dl className="grid grid-cols-2 gap-5">
          <DetailItem label="Status"><StatusBadge status={detailQuery.data.status} /></DetailItem><DetailItem label="Date">{detailQuery.data.date}</DetailItem>
          <DetailItem label="Direction">{detailQuery.data.direction === 'received' ? 'Received from customer' : 'Made to supplier'}</DetailItem>
          <DetailItem label="Amount">{amountLabel(detailQuery.data.amount, config?.currency)}</DetailItem>
          <DetailItem label="Counterparty">{detailQuery.data.counterparty_name}</DetailItem><DetailItem label="Journal entry">#{detailQuery.data.entry}</DetailItem>
          {detailQuery.data.related_sale && <DetailItem label="Related sale"><Link to={`/transactions/sales?id=${detailQuery.data.related_sale}`} className="text-brand hover:underline">Sale #{detailQuery.data.related_sale}</Link></DetailItem>}
          {detailQuery.data.related_purchase && <DetailItem label="Related purchase"><Link to={`/transactions/purchases?id=${detailQuery.data.related_purchase}`} className="text-brand hover:underline">Purchase #{detailQuery.data.related_purchase}</Link></DetailItem>}
        </dl>}
      </FormModal>}

      {voiding && <VoidDialog label={`payment #${voiding.id}`} pending={voidMutation.isPending} error={voidMutation.error} onConfirm={() => voidMutation.mutate(voiding.id)} onCancel={() => setVoiding(null)} />}
    </div>
  )
}
