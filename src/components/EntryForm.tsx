import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAccounts } from '../hooks/useAccounts'
import { useCreateEntry } from '../hooks/useCreateEntry'

const lineSchema = z.object({
  id: z.string().optional(), // RHF appends this for its own keying — must allow it
  account: z.string().min(1, 'Select an account'),
  type: z.enum(['D', 'C']),
  value: z.number({ error: 'Enter a number' }).positive('Must be > 0'),
})

const entrySchema = z.object({
  description: z.string().min(1, 'Required'),
  date: z.string().min(1, 'Required'),
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
}

export default function EntryForm({ onSuccess }: Props) {
  const { data: accounts } = useAccounts()

  const mutation = useCreateEntry({
    onSuccess,
  })

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      lines: [
        { account: '', type: 'D', value: 0 },
        { account: '', type: 'C', value: 0 },
      ],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'lines' })

  function onSubmit(data: FormValues) {
    mutation.mutate({
      description: data.description,
      date: data.date,
      lines: data.lines.map(l => ({
        account: l.account,
        type: l.type,
        value: String(l.value),
      })),
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-gray-500">Description</label>
          <input
            {...register('description')}
            placeholder="e.g. Monthly rent payment"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && (
            <p className="text-xs text-red-500">{errors.date.message}</p>
          )}
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
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          className="text-sm text-blue-600 hover:text-blue-700 text-left"
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
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}
