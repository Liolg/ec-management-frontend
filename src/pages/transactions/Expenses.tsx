import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Ban, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import { expensesApi } from '../../api/business'
import EmptyState from '../../components/EmptyState'
import FormModal from '../../components/FormModal'
import PageHeader from '../../components/PageHeader'
import { useToast } from '../../context/ToastContext'
import { useBusinessConfig } from '../../hooks/useBusinessConfig'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { Expense, ExpenseCategory, ExpenseInput } from '../../types/business'
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

const categories: Array<{ value: ExpenseCategory; label: string }> = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Other' },
]

const categoryLabel = (value: ExpenseCategory) => categories.find((item) => item.value === value)?.label ?? value

const emptyForm = (): ExpenseInput => ({
  description: '',
  category: 'other',
  amount: '',
  date: today(),
  payment_method: 'cash',
})

export default function Expenses() {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const { data: config } = useBusinessConfig()
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useTransactionDetailId()
  const [voiding, setVoiding] = useState<Expense | null>(null)
  const [form, setForm] = useState<ExpenseInput>(emptyForm)

  const expensesQuery = useQuery({ queryKey: ['expenses'], queryFn: expensesApi.list })
  const detailQuery = useQuery({
    queryKey: ['expense', selectedId],
    queryFn: () => expensesApi.get(selectedId as number),
    enabled: selectedId !== null,
  })

  const invalidate = () => {
    for (const queryKey of [['expenses'], ['entries'], ['summary'], ['profit-loss']]) {
      queryClient.invalidateQueries({ queryKey })
    }
  }

  const createMutation = useMutation({
    mutationFn: expensesApi.create,
    onSuccess: () => {
      invalidate()
      setShowCreate(false)
      setForm(emptyForm())
      showToast('Expense recorded', 'success')
    },
    onError: (error) => showToast(getErrorMessage(error)),
  })
  const voidMutation = useMutation({
    mutationFn: expensesApi.void,
    onSuccess: (expense) => {
      invalidate()
      queryClient.setQueryData(['expense', expense.id], expense)
      setVoiding(null)
      showToast('Expense voided', 'success')
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

  if (expensesQuery.isLoading) return <p className="p-8 text-gray-500">Loading expenses…</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Expenses" action={
        config === null
          ? <Link to="/setup" className={primaryButtonClass}>Complete setup</Link>
          : <button type="button" onClick={openCreate} disabled={!config} className={primaryButtonClass}>New Expense</button>
      } />
      {config === null && <SetupRequired />}
      {expensesQuery.isError && <QueryError message={getErrorMessage(expensesQuery.error)} onRetry={() => expensesQuery.refetch()} />}

      {!expensesQuery.isError && <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-500"><tr>
            <th className="px-6 py-3 font-medium">Date</th><th className="px-6 py-3 font-medium">Description</th>
            <th className="px-6 py-3 font-medium">Category</th><th className="px-6 py-3 text-right font-medium">Amount</th>
            <th className="px-6 py-3 font-medium">Payment</th><th className="px-6 py-3 font-medium">Status</th><th className="px-6 py-3" />
          </tr></thead>
          <tbody className="divide-y divide-gray-100">
            {expensesQuery.data?.length === 0 && <tr><td colSpan={7}><EmptyState message="No expenses yet." /></td></tr>}
            {expensesQuery.data?.map((expense) => <tr key={expense.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 text-gray-500">{expense.date}</td><td className="px-6 py-4 text-gray-900">{expense.description}</td>
              <td className="px-6 py-4 text-gray-500">{categoryLabel(expense.category)}</td>
              <td className="px-6 py-4 text-right font-medium text-gray-900">{amountLabel(expense.amount, config?.currency)}</td>
              <td className="px-6 py-4 capitalize text-gray-500">{expense.payment_method}</td><td className="px-6 py-4"><StatusBadge status={expense.status} /></td>
              <td className="px-6 py-4"><div className="flex justify-end gap-3">
                <button type="button" onClick={() => setSelectedId(expense.id)} title="View expense" className="text-gray-400 hover:text-brand"><Eye size={16} /></button>
                {expense.status !== 'voided' && <button type="button" onClick={() => { voidMutation.reset(); setVoiding(expense) }} title="Void expense" className="text-gray-400 hover:text-red-600"><Ban size={16} /></button>}
              </div></td>
            </tr>)}
          </tbody>
        </table>
      </div>}

      {showCreate && <FormModal title="Record expense" onClose={createMutation.isPending ? () => undefined : () => setShowCreate(false)}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <label className={labelClass}>Description<input required maxLength={200} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className={inputClass} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ExpenseCategory })} className={inputClass}>
              {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
            </select></label>
            <label className={labelClass}>Amount<input required min="0.01" step="0.01" type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Date<input required type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} className={inputClass} /></label>
            <label className={labelClass}>Payment method<select value={form.payment_method} onChange={(event) => setForm({ ...form, payment_method: event.target.value as ExpenseInput['payment_method'] })} className={inputClass}>
              <option value="cash">Cash</option><option value="credit">Credit / invoice</option>
            </select></label>
          </div>
          <MutationError error={createMutation.error} />
          <div className="flex justify-end"><button disabled={createMutation.isPending} className={primaryButtonClass}>{createMutation.isPending ? 'Recording…' : 'Record expense'}</button></div>
        </form>
      </FormModal>}

      {selectedId !== null && <FormModal title={`Expense #${selectedId}`} onClose={() => setSelectedId(null)}>
        {detailQuery.isLoading && <p className="text-sm text-gray-500">Loading details…</p>}
        {detailQuery.isError && <QueryError message={getErrorMessage(detailQuery.error)} onRetry={() => detailQuery.refetch()} />}
        {detailQuery.data && <dl className="grid grid-cols-2 gap-5">
          <DetailItem label="Status"><StatusBadge status={detailQuery.data.status} /></DetailItem><DetailItem label="Date">{detailQuery.data.date}</DetailItem>
          <DetailItem label="Description">{detailQuery.data.description}</DetailItem><DetailItem label="Category">{categoryLabel(detailQuery.data.category)}</DetailItem>
          <DetailItem label="Amount">{amountLabel(detailQuery.data.amount, config?.currency)}</DetailItem><DetailItem label="Payment">{detailQuery.data.payment_method}</DetailItem>
          <DetailItem label="Journal entry">#{detailQuery.data.entry}</DetailItem>
        </dl>}
      </FormModal>}

      {voiding && <VoidDialog label={`expense #${voiding.id}`} pending={voidMutation.isPending} error={voidMutation.error} onConfirm={() => voidMutation.mutate(voiding.id)} onCancel={() => setVoiding(null)} />}
    </div>
  )
}
