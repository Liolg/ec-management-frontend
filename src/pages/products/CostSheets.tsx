import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Calculator, Pencil, Plus, Trash2 } from 'lucide-react'
import { costSheetsApi, laborsApi, materialsApi } from '../../api/products'
import ConfirmModal from '../../components/ConfirmModal'
import EmptyState from '../../components/EmptyState'
import FormModal from '../../components/FormModal'
import PageHeader from '../../components/PageHeader'
import { useToast } from '../../context/ToastContext'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { CostSheet, CostSheetInput } from '../../types/products'

const inputClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand'

function money(value: number | null | undefined) {
  return value == null ? '—' : Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface EditableMaterialLine { material: string; qty: string }
interface EditableLaborLine { labor: string; qty: string }

function CostSheetForm({ costSheet, onSuccess, onPendingChange }: { costSheet: CostSheet | null; onSuccess: () => void; onPendingChange: (pending: boolean) => void }) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const materials = useQuery({ queryKey: ['materials'], queryFn: materialsApi.list })
  const labors = useQuery({ queryKey: ['labors'], queryFn: laborsApi.list })
  const [name, setName] = useState(costSheet?.name ?? '')
  const [unit, setUnit] = useState(costSheet?.unit ?? '')
  const [overhead, setOverhead] = useState(costSheet?.manufacturing_overhead == null ? '' : String(costSheet.manufacturing_overhead))
  const [nonManufacturing, setNonManufacturing] = useState(costSheet?.non_manufacturing_cost == null ? '' : String(costSheet.non_manufacturing_cost))
  const [margin, setMargin] = useState(costSheet?.profit_margin == null ? '' : String(costSheet.profit_margin))
  const [materialLines, setMaterialLines] = useState<EditableMaterialLine[]>(
    costSheet?.material_lines.map((line) => ({ material: String(line.material), qty: String(line.qty) })) ?? [],
  )
  const [laborLines, setLaborLines] = useState<EditableLaborLine[]>(
    costSheet?.labor_lines.map((line) => ({ labor: String(line.labor), qty: String(line.qty) })) ?? [],
  )
  const [validationError, setValidationError] = useState('')

  const mutation = useMutation({
    mutationFn: (data: CostSheetInput) => costSheet ? costSheetsApi.update(costSheet.id, data) : costSheetsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-sheets'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      showToast(`Cost sheet ${costSheet ? 'updated' : 'created'}`, 'success')
      onSuccess()
    },
    onError: (error) => showToast(getErrorMessage(error)),
    onSettled: () => onPendingChange(false),
  })

  function updateMaterial(index: number, patch: Partial<EditableMaterialLine>) {
    setMaterialLines((lines) => lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line))
  }

  function updateLabor(index: number, patch: Partial<EditableLaborLine>) {
    setLaborLines((lines) => lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line))
  }

  function optionalNumber(value: string) {
    return value === '' ? null : Number(value)
  }

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const numericOverhead = optionalNumber(overhead)
    const numericNonManufacturing = optionalNumber(nonManufacturing)
    const numericMargin = optionalNumber(margin)
    const invalidCosts = [numericOverhead, numericNonManufacturing].some((value) => value != null && (!Number.isFinite(value) || value < 0))
    const invalidMargin = numericMargin != null && (!Number.isFinite(numericMargin) || numericMargin < 0 || numericMargin >= 100)
    const invalidMaterialLine = materialLines.some((line) => !Number(line.material) || !Number.isInteger(Number(line.qty)) || Number(line.qty) <= 0)
    const invalidLaborLine = laborLines.some((line) => !Number(line.labor) || !Number.isInteger(Number(line.qty)) || Number(line.qty) <= 0)
    const duplicateMaterials = new Set(materialLines.map((line) => line.material)).size !== materialLines.length
    const duplicateLabors = new Set(laborLines.map((line) => line.labor)).size !== laborLines.length

    if (!name.trim()) setValidationError('Name is required.')
    else if (invalidCosts) setValidationError('Overhead and non-manufacturing cost must be zero or greater.')
    else if (invalidMargin) setValidationError('Profit margin must be between 0 and less than 100%.')
    else if (invalidMaterialLine || invalidLaborLine) setValidationError('Every line needs an item and a positive whole-number quantity.')
    else if (duplicateMaterials || duplicateLabors) setValidationError('Each material or labor rate can only be used once.')
    else {
      setValidationError('')
      onPendingChange(true)
      mutation.mutate({
        name: name.trim(),
        unit: unit.trim() || null,
        manufacturing_overhead: numericOverhead,
        non_manufacturing_cost: numericNonManufacturing,
        profit_margin: numericMargin,
        material_lines: materialLines.map((line) => ({ material: Number(line.material), qty: Number(line.qty) })),
        labor_lines: laborLines.map((line) => ({ labor: Number(line.labor), qty: Number(line.qty) })),
      })
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      <div className="grid grid-cols-[1fr_140px] gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={50} className={inputClass} autoFocus /></label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Finished unit<input value={unit} onChange={(event) => setUnit(event.target.value)} maxLength={10} placeholder="item" className={inputClass} /></label>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">Direct materials</h3><button type="button" onClick={() => setMaterialLines((lines) => [...lines, { material: '', qty: '1' }])} className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover"><Plus size={14} /> Add material</button></div>
        {materialLines.length === 0 && <p className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-500">No material lines.</p>}
        {materialLines.map((line, index) => {
          const material = materials.data?.find((item) => item.id === Number(line.material))
          return <div key={index} className="grid grid-cols-[1fr_100px_110px_28px] items-start gap-2">
            <select value={line.material} onChange={(event) => updateMaterial(index, { material: event.target.value })} className={inputClass}><option value="">Select material…</option>{materials.data?.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}</select>
            <input aria-label="Material quantity" type="number" min="1" step="1" value={line.qty} onChange={(event) => updateMaterial(index, { qty: event.target.value })} className={inputClass} />
            <span className="px-2 py-2 text-right text-sm tabular-nums text-gray-500">{money(material ? material.cost_by_unit * Number(line.qty || 0) : null)}</span>
            <button type="button" onClick={() => setMaterialLines((lines) => lines.filter((_, lineIndex) => lineIndex !== index))} className="mt-2 text-gray-400 hover:text-red-500" title="Remove"><Trash2 size={14} /></button>
          </div>
        })}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-gray-800">Direct labor</h3><button type="button" onClick={() => setLaborLines((lines) => [...lines, { labor: '', qty: '1' }])} className="flex items-center gap-1 text-sm text-brand hover:text-brand-hover"><Plus size={14} /> Add labor</button></div>
        {laborLines.length === 0 && <p className="rounded-lg bg-gray-50 px-3 py-3 text-sm text-gray-500">No labor lines.</p>}
        {laborLines.map((line, index) => {
          const labor = labors.data?.find((item) => item.id === Number(line.labor))
          return <div key={index} className="grid grid-cols-[1fr_100px_110px_28px] items-start gap-2">
            <select value={line.labor} onChange={(event) => updateLabor(index, { labor: event.target.value })} className={inputClass}><option value="">Select labor…</option>{labors.data?.map((item) => <option key={item.id} value={item.id}>{item.name} / {item.time_unit}</option>)}</select>
            <input aria-label="Labor quantity" type="number" min="1" step="1" value={line.qty} onChange={(event) => updateLabor(index, { qty: event.target.value })} className={inputClass} />
            <span className="px-2 py-2 text-right text-sm tabular-nums text-gray-500">{money(labor ? labor.cost_by_unit * Number(line.qty || 0) : null)}</span>
            <button type="button" onClick={() => setLaborLines((lines) => lines.filter((_, lineIndex) => lineIndex !== index))} className="mt-2 text-gray-400 hover:text-red-500" title="Remove"><Trash2 size={14} /></button>
          </div>
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Manufacturing overhead<input type="number" min="0" step="1" value={overhead} onChange={(event) => setOverhead(event.target.value)} className={inputClass} /></label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Non-manufacturing cost<input type="number" min="0" step="1" value={nonManufacturing} onChange={(event) => setNonManufacturing(event.target.value)} className={inputClass} /></label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-500">Profit margin (%)<input type="number" min="0" max="99.99" step="any" value={margin} onChange={(event) => setMargin(event.target.value)} className={inputClass} /></label>
      </div>
      {costSheet && <div className="grid grid-cols-3 gap-3 rounded-lg bg-gray-50 p-3 text-sm"><div><span className="block text-xs text-gray-500">Manufacturing total</span>{money(costSheet.total_manufacturing_cost)}</div><div><span className="block text-xs text-gray-500">Total cost</span>{money(costSheet.total_cost)}</div><div><span className="block text-xs text-gray-500">Selling price</span>{money(costSheet.selling_price)}</div></div>}
      {(validationError || mutation.isError || materials.isError || labors.isError) && <p className="text-sm text-red-500">{validationError || (mutation.isError ? getErrorMessage(mutation.error) : 'Failed to load line options.')}</p>}
      <div className="flex justify-end"><button disabled={mutation.isPending || materials.isLoading || labors.isLoading} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">{mutation.isPending ? 'Saving…' : 'Save cost sheet'}</button></div>
    </form>
  )
}

export default function CostSheets() {
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<CostSheet | null>(null)
  const [deleting, setDeleting] = useState<CostSheet | null>(null)
  const [formPending, setFormPending] = useState(false)
  const queryClient = useQueryClient()
  const { showToast } = useToast()
  const query = useQuery({ queryKey: ['cost-sheets'], queryFn: costSheetsApi.list })
  const deleteMutation = useMutation({ mutationFn: costSheetsApi.delete, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cost-sheets'] }); queryClient.invalidateQueries({ queryKey: ['products'] }); showToast('Cost sheet deleted', 'success'); setDeleting(null) }, onError: (error) => showToast(getErrorMessage(error)) })
  const calculateMutation = useMutation({ mutationFn: costSheetsApi.calculate, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['cost-sheets'] }); queryClient.invalidateQueries({ queryKey: ['products'] }); queryClient.invalidateQueries({ queryKey: ['inventory'] }); showToast('Cost sheet recalculated', 'success') }, onError: (error) => showToast(getErrorMessage(error)) })

  if (query.isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (query.isError) return <p className="p-8 text-red-500">Failed to load cost sheets.</p>

  return <div className="flex flex-col gap-6">
    <PageHeader title="Cost Sheets" action={<button onClick={() => setCreating(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover">New Cost Sheet</button>} />
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="border-b border-gray-200 bg-gray-50"><tr><th className="px-6 py-3 text-left font-medium text-gray-500">Name</th><th className="px-6 py-3 text-left font-medium text-gray-500">Unit</th><th className="px-6 py-3 text-center font-medium text-gray-500">Lines</th><th className="px-6 py-3 text-right font-medium text-gray-500">Total cost</th><th className="px-6 py-3 text-right font-medium text-gray-500">Selling price</th><th className="w-28 px-6 py-3" /></tr></thead><tbody className="divide-y divide-gray-100">
      {query.data?.length === 0 && <tr><td colSpan={6}><EmptyState message="No cost sheets yet. Add materials and labor, then create one." /></td></tr>}
      {query.data?.map((sheet) => <tr key={sheet.id} className="hover:bg-gray-50"><td className="px-6 py-4 text-gray-900">{sheet.name}</td><td className="px-6 py-4 text-gray-500">{sheet.unit || '—'}</td><td className="px-6 py-4 text-center text-gray-500">{sheet.material_lines.length + sheet.labor_lines.length}</td><td className="px-6 py-4 text-right tabular-nums text-gray-700">{money(sheet.total_cost)}</td><td className="px-6 py-4 text-right tabular-nums font-medium text-gray-900">{money(sheet.selling_price)}</td><td className="px-6 py-4"><div className="flex justify-end gap-2"><button onClick={() => calculateMutation.mutate(sheet.id)} disabled={calculateMutation.isPending} className="text-gray-400 hover:text-green-600 disabled:opacity-40" title="Recalculate"><Calculator size={15} /></button><button onClick={() => setEditing(sheet)} className="text-gray-400 hover:text-brand" title="Edit"><Pencil size={14} /></button><button onClick={() => setDeleting(sheet)} className="text-gray-400 hover:text-red-500" title="Delete"><Trash2 size={14} /></button></div></td></tr>)}
    </tbody></table></div>
    {creating && <FormModal title="Create cost sheet" maxWidth="max-w-3xl" onClose={() => { if (!formPending) setCreating(false) }}><CostSheetForm costSheet={null} onSuccess={() => setCreating(false)} onPendingChange={setFormPending} /></FormModal>}
    {editing && <FormModal title="Edit cost sheet" maxWidth="max-w-3xl" onClose={() => { if (!formPending) setEditing(null) }}><CostSheetForm costSheet={editing} onSuccess={() => setEditing(null)} onPendingChange={setFormPending} /></FormModal>}
    {deleting && <ConfirmModal title="Delete cost sheet" message={`Delete “${deleting.name}”? Cost sheets assigned to products may not be deletable.`} confirmLabel="Delete" danger pending={deleteMutation.isPending} error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined} onConfirm={() => deleteMutation.mutate(deleting.id)} onCancel={() => setDeleting(null)} />}
  </div>
}
