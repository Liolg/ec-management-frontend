import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAccounts } from '../hooks/useAccounts'
import { useCreateEntry } from '../hooks/useCreateEntry'
import { useUpdateEntry } from '../hooks/useUpdateEntry'
import { getErrorMessage } from '../lib/getErrorMessage'
import type { Entry } from '../types/accounts'

const amountPattern = /^\d{1,16}(\.\d{1,2})?$/

const lineSchema = z.object({
  lineId: z.number().optional(),
  account: z.string().regex(/^[1-9]\d*$/, 'Select an account'),
  type: z.enum(['D', 'C']),
  value: z.string().regex(amountPattern, 'Enter an amount with up to two decimal places'),
})

const entrySchema = z.object({
  description: z.string().min(1, 'Required'),
  date: z.iso.date('Required'),
  reference: z.string().max(128).optional(),
  lines: z.array(lineSchema).min(2, 'Add at least 2 lines'),
}).refine(
  ({ lines }) => {
    if (lines.some(({ value }) => !amountPattern.test(value))) return true
    let balance = 0n
    for (const { type, value } of lines) {
      const [whole, fraction = ''] = value.split('.')
      const cents = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'))
      balance += type === 'D' ? cents : -cents
    }
    return balance === 0n
  },
  { message: 'Debits must equal credits', path: ['lines'] },
)

type FormValues = z.infer<typeof entrySchema>

interface Props {
  onSuccess: () => void
  entryId?: number
  defaultEntry?: Entry
}

export default function EntryForm({ onSuccess, entryId, defaultEntry }: Props) {
  const { data: accounts, isError: accountError, isPending: accountsPending } = useAccounts()
  const createMutation = useCreateEntry({ onSuccess })
  const updateMutation = useUpdateEntry({ onSuccess })
  const mutation = entryId ? updateMutation : createMutation

  const defaultLines = defaultEntry?.lines.map(l => ({
    lineId: l.id,
    account: String(l.account),
    type: l.type,
    value: l.value,
  })) ?? [
    { account: '', type: 'D' as const, value: '' },
    { account: '', type: 'C' as const, value: '' },
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
        id: l.lineId,
        account: Number(l.account),
        type: l.type,
        value: l.value,
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
          <label htmlFor="entry-description" className="text-xs font-medium text-gray-500">Description</label>
          <input
            id="entry-description"
            {...register('description')}
            placeholder="e.g. Monthly rent payment"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {errors.description && (
            <p className="text-xs text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="entry-date" className="text-xs font-medium text-gray-500">Date</label>
          <input
            id="entry-date"
            type="date"
            {...register('date')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {errors.date && (
            <p className="text-xs text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1 w-36">
          <label htmlFor="entry-reference" className="text-xs font-medium text-gray-500">Reference</label>
          <input
            id="entry-reference"
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
                aria-label={`Account for line ${index + 1}`}
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
              aria-label={`Debit or credit for line ${index + 1}`}
              {...register(`lines.${index}.type`)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              <option value="D">Debit</option>
              <option value="C">Credit</option>
            </select>

            <div className="flex flex-col gap-1">
              <input
                inputMode="decimal"
                aria-label={`Amount for line ${index + 1}`}
                {...register(`lines.${index}.value`)}
                placeholder="0.00"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              />
              {errors.lines?.[index]?.value && (
                <p className="text-xs text-red-500">{errors.lines[index].value?.message}</p>
              )}
            </div>

            <button
              type="button"
              aria-label={`Remove line ${index + 1}`}
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
          onClick={() => append({ account: '', type: 'D', value: '' })}
          className="text-sm text-brand hover:text-brand-hover text-left"
        >
          + Add line
        </button>
      </div>

      {mutation.isError && (
        <p role="alert" className="text-sm text-red-500">{getErrorMessage(mutation.error)}</p>
      )}
      {accountError && <p role="alert" className="text-sm text-red-500">Failed to load accounts.</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending || accountsPending || !accounts?.length}
          className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'Save entry'}
        </button>
      </div>
    </form>
  )
}
