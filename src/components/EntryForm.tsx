import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAccounts } from '../hooks/useAccounts'
import { useCreateEntry } from '../hooks/useCreateEntry'
import { useUpdateEntry } from '../hooks/useUpdateEntry'
import type { Entry } from '../types/accounts'

const lineSchema = z.object({
  id: z.string().optional(),
  account: z.string().min(1, 'Select an account'),
  type: z.enum(['D', 'C']),
  value: z.number({ error: 'Enter a number' }).positive('Must be > 0'),
})

const entrySchema = z.object({
  description: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
  reference: z.string().optional(),
  lines: z.array(lineSchema).min(2, 'Add at least 2 lines'),
}).refine(
  (data) => {
    const sum = (t: 'D' | 'C') =>
      data.lines.filter(l => l.type === t).reduce((acc, l) => acc + (l.value ?? 0), 0)
    return Math.abs(sum('D') - sum('C')) < 0.001
  },
  { message: 'Debits must equal credits', path: ['lines'] },
)

type FormValues = z.infer<typeof entrySchema>

interface Props {
  onSuccess: () => void
  entryId?: string
  defaultEntry?: Entry
}

export default function EntryForm({ onSuccess, entryId, defaultEntry }: Props) {
  const { data: accounts } = useAccounts()
  const createMutation = useCreateEntry({ onSuccess })
  const updateMutation = useUpdateEntry({ onSuccess })
  const mutation = entryId ? updateMutation : createMutation

  const defaultLines = defaultEntry?.lines.map(l => ({
    id: l.id,
    account: l.account.id,
    type: l.type,
    value: parseFloat(l.value),
  })) ?? [
    { account: '', type: 'D' as const, value: 0 },
    { account: '', type: 'C' as const, value: 0 },
  ]

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      description: defaultEntry?.description ?? '',
      date: defaultEntry?.date ?? '',
      reference: defaultEntry?.reference ?? '',
      lines: defaultLines,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  function onSubmit(data: FormValues) {
    const payload = {
      description: data.description,
      date: data.date,
      reference: data.reference,
      lines: data.lines.map(l => ({
        id: l.id,
        account: l.account,
        type: l.type,
        value: String(l.value),
      })),
    }
    if (entryId) {
      updateMutation.mutate({ id: entryId, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-gray-500">Description</label>
          <input
            {...register('description')}
            placeholder="e.g. Monthly rent payment"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date</label>
          <input
            type="date"
            {...register('date')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {errors.date && (
            <p className="text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 w-36">
          <label className="text-xs font-medium text-gray-500">Reference</label>
          <input
            {...register('reference')}
            placeholder="e.g. INV-001"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-[1fr_80px_120px_32px] gap-2 px-1">
          <span className="text-xs font-medium text-gray-500">Account</span>
          <span className="text-xs font-medium text-gray-500">D / C</span>
          <span className="text-xs font-medium text-gray-500">Amount</span>
          <span />
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-[1fr_80px_120px_32px] gap-2 items-start">
            <div className="flex flex-col gap-1">
              <select
                {...register(`lines.${index}.account`)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="">Select…</option>
                {accounts?.map(a => (
                  <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                ))}
              </select>
              {errors.lines?.[index]?.account && (
                <p className="text-xs text-red-500">{errors.lines[index].account?.message}</p>
              )}
            </div>

            <select
              {...register(`lines.${index}.type`)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="D">Debit</option>
              <option value="C">Credit</option>
            </select>

            <div className="flex flex-col gap-1">
              <input
                type="number"
                step="0.01"
                {...register(`lines.${index}.value`, { valueAsNumber: true })}
                placeholder="0.00"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {errors.lines?.[index]?.value && (
                <p className="text-xs text-red-500">{errors.lines[index].value?.message}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => remove(index)}
              disabled={fields.length <= 2}
              className="mt-2 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}

        {errors.lines?.root && (
          <p className="text-xs text-red-500">{errors.lines.root.message}</p>
        )}
        {typeof errors.lines?.message === 'string' && (
          <p className="text-xs text-red-500">{errors.lines.message}</p>
        )}

        <button
          type="button"
          onClick={() => append({ account: '', type: 'D', value: 0 })}
          className="text-sm text-brand hover:text-brand-hover text-left"
        >
          + Add line
        </button>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">Failed to save entry. Try again.</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}
