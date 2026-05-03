import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAccount } from '../hooks/useCreateAccount'
import { useUpdateAccount } from '../hooks/useUpdateAccount'

const schema = z.object({
  code: z.number({ error: 'Enter a number' }).int().positive('Must be positive'),
  name: z.string().min(1, 'Required'),
  type: z.enum(['asset', 'liability', 'equity', 'income', 'expense']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  onSuccess: () => void
  accountId?: string
  defaultValues?: Partial<FormValues>
}

export default function AccountForm({ onSuccess, accountId, defaultValues }: Props) {
  const createMutation = useCreateAccount({ onSuccess })
  const updateMutation = useUpdateAccount({ onSuccess })
  const mutation = accountId ? updateMutation : createMutation

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: 'asset', ...defaultValues },
  })

  function onSubmit(data: FormValues) {
    if (accountId) {
      updateMutation.mutate({ id: accountId, data })
    } else {
      createMutation.mutate(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex gap-3">
        <div className="flex flex-col gap-1 w-28">
          <label className="text-xs font-medium text-gray-500">Code</label>
          <input
            type="number"
            {...register('code', { valueAsNumber: true })}
            placeholder="1000"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {errors.code && <p className="text-xs text-red-500">{errors.code.message}</p>}
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-gray-500">Name</label>
          <input
            {...register('name')}
            placeholder="e.g. Cash and Cash Equivalents"
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Type</label>
          <select
            {...register('type')}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {(['asset', 'liability', 'equity', 'income', 'expense'] as const).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          {errors.type && <p className="text-xs text-red-500">{errors.type.message}</p>}
        </div>
      </div>

      {mutation.isError && (
        <p className="text-sm text-red-500">Failed to save account. Try again.</p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {mutation.isPending ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
