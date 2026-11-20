import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'
import EmptyState from '../../components/EmptyState'
import FormModal from '../../components/FormModal'
import PageHeader from '../../components/PageHeader'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type {
  DirectLabor,
  DirectLaborInput,
  DirectMaterial,
  DirectMaterialInput,
} from '../../types/products'

type Resource = DirectMaterial | DirectLabor
type ResourceInput = DirectMaterialInput | DirectLaborInput

interface ResourceApi<T extends Resource, TInput extends ResourceInput> {
  list: () => Promise<T[]>
  create: (data: TInput) => Promise<T>
  update: (id: number, data: Partial<TInput>) => Promise<T>
  delete: (id: number) => Promise<unknown>
}

interface Props<T extends Resource, TInput extends ResourceInput> {
  title: string
  singular: string
  queryKey: 'materials' | 'labors'
  unitField: 'unit' | 'time_unit'
  unitLabel: string
  emptyMessage: string
  api: ResourceApi<T, TInput>
}

const inputClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand'

function getUnit(item: Resource, unitField: 'unit' | 'time_unit') {
  return unitField === 'unit'
    ? (item as DirectMaterial).unit
    : (item as DirectLabor).time_unit
}

function ResourceForm<T extends Resource, TInput extends ResourceInput>({
  item,
  singular,
  unitField,
  api,
  queryKey,
  onSuccess,
  onPendingChange,
}: Pick<Props<T, TInput>, 'singular' | 'unitField' | 'api' | 'queryKey'> & {
  item: T | null
  onSuccess: () => void
  onPendingChange: (pending: boolean) => void
}) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const [name, setName] = useState(item?.name ?? '')
  const [unit, setUnit] = useState(item ? getUnit(item, unitField) : '')
  const [cost, setCost] = useState(item ? String(item.cost_by_unit) : '')
  const [validationError, setValidationError] = useState('')

  const mutation = useMutation({
    mutationFn: (data: TInput) => item ? api.update(item.id, data) : api.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      showToast(`${singular} ${item ? 'updated' : 'created'}`, 'success')
      onSuccess()
    },
    onError: (error) => showToast(getErrorMessage(error)),
    onSettled: () => onPendingChange(false),
  })

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const numericCost = Number(cost)
    if (!name.trim() || !unit.trim()) {
      setValidationError('Name and unit are required.')
      return
    }
    if (!Number.isFinite(numericCost) || numericCost < 0 || (queryKey === 'materials' && !Number.isInteger(numericCost))) {
      setValidationError(queryKey === 'materials' ? 'Material cost must be a whole number zero or greater.' : 'Cost per unit must be zero or greater.')
      return
    }
    setValidationError('')
    onPendingChange(true)
    mutation.mutate({
      name: name.trim(),
      [unitField]: unit.trim(),
      cost_by_unit: numericCost,
    } as TInput)
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
        Name
        <input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} className={inputClass} autoFocus />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Unit
          <input value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={10} className={inputClass} placeholder={unitField === 'time_unit' ? 'hour' : 'kg'} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">
          Cost per unit
          <input type="number" min="0" step={queryKey === 'materials' ? '1' : 'any'} value={cost} onChange={(event) => setCost(event.target.value)} className={inputClass} />
        </label>
      </div>
      {(validationError || mutation.isError) && (
        <p className="text-sm text-red-500">{validationError || getErrorMessage(mutation.error)}</p>
      )}
      <div className="flex justify-end">
        <button disabled={mutation.isPending} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:opacity-50">
          {mutation.isPending ? 'Saving…' : `Save ${singular.toLowerCase()}`}
        </button>
      </div>
    </form>
  )
}

export default function ResourcePage<T extends Resource, TInput extends ResourceInput>({
  title,
  singular,
  queryKey,
  unitField,
  unitLabel,
  emptyMessage,
  api,
}: Props<T, TInput>) {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [deleting, setDeleting] = useState<T | null>(null)
  const [formPending, setFormPending] = useState(false)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const query = useQuery({ queryKey: [queryKey], queryFn: api.list })
  const deleteMutation = useMutation({
    mutationFn: api.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] })
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      showToast(`${singular} deleted`, 'success')
      setDeleting(null)
    },
    onError: (error) => showToast(getErrorMessage(error)),
  })

  useEffect(() => {
    if (query.error) showToast(getErrorMessage(query.error))
  }, [query.error, showToast])

  if (query.isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (query.isError) return <p className="p-8 text-red-500">Failed to load {title.toLowerCase()}.</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={title}
        action={<button onClick={() => setCreating(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover">New {singular}</button>}
      />
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left font-medium text-gray-500">Name</th>
              <th className="px-6 py-3 text-left font-medium text-gray-500">{unitLabel}</th>
              <th className="px-6 py-3 text-right font-medium text-gray-500">Cost / unit</th>
              <th className="w-24 px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {query.data?.length === 0 && <tr><td colSpan={4}><EmptyState message={emptyMessage} /></td></tr>}
            {query.data?.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-500">{getUnit(item, unitField)}</td>
                <td className="px-6 py-4 text-right tabular-nums text-gray-700">{Number(item.cost_by_unit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td className="px-6 py-4"><div className="flex justify-end gap-2">
                  <button onClick={() => setEditing(item)} className="text-gray-400 transition-colors hover:text-brand" title="Edit"><Pencil size={14} /></button>
                  <button onClick={() => setDeleting(item)} className="text-gray-400 transition-colors hover:text-red-500" title="Delete"><Trash2 size={14} /></button>
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {creating && <FormModal title={`Create ${singular.toLowerCase()}`} onClose={() => { if (!formPending) setCreating(false) }}><ResourceForm item={null} singular={singular} unitField={unitField} api={api} queryKey={queryKey} onSuccess={() => setCreating(false)} onPendingChange={setFormPending} /></FormModal>}
      {editing && <FormModal title={`Edit ${singular.toLowerCase()}`} onClose={() => { if (!formPending) setEditing(null) }}><ResourceForm item={editing} singular={singular} unitField={unitField} api={api} queryKey={queryKey} onSuccess={() => setEditing(null)} onPendingChange={setFormPending} /></FormModal>}
      {deleting && <ConfirmModal title={`Delete ${singular.toLowerCase()}`} message={`Delete “${deleting.name}”? This cannot be undone if it is not in use.`} confirmLabel="Delete" danger pending={deleteMutation.isPending} error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined} onConfirm={() => deleteMutation.mutate(deleting.id)} onCancel={() => setDeleting(null)} />}
    </div>
  )
}
