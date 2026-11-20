import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { setupApi } from '../api/business'
import PageHeader from '../components/PageHeader'
import { useToast } from '../context/ToastContext'
import { useAccounts } from '../hooks/useAccounts'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { getErrorMessage } from '../lib/getErrorMessage'
import type { BusinessConfig, BusinessConfigInput } from '../types/business'

const accountFields = [
  ['cash_account', 'Cash / Bank'],
  ['receivable_account', 'Accounts receivable'],
  ['payable_account', 'Accounts payable'],
  ['revenue_account', 'Revenue'],
  ['inventory_account', 'Inventory'],
  ['expense_account', 'Operating expenses'],
  ['cogs_account', 'Cost of goods sold'],
] as const

type SetupFields = {
  company_name: string
  currency: string
} & Partial<Record<(typeof accountFields)[number][0], string>>

const inputClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand'

function initialValues(config: BusinessConfig | null): SetupFields {
  const values: SetupFields = {
    company_name: config?.company_name ?? '',
    currency: config?.currency ?? 'USD',
  }
  if (config) {
    for (const [field] of accountFields) values[field] = String(config[field]?.id ?? '')
  }
  return values
}

function SetupForm({ config }: { config: BusinessConfig | null }) {
  const queryClient = useQueryClient()
  const accounts = useAccounts()
  const { showToast } = useToast()
  const { handleSubmit, register, reset, formState: { dirtyFields } } = useForm<SetupFields>({
    defaultValues: initialValues(config),
  })

  const save = useMutation({
    mutationFn: (values: SetupFields) => {
      const company = { company_name: values.company_name.trim(), currency: values.currency.trim() }
      if (!config) return setupApi.create(company)

      const changes: BusinessConfigInput = {}
      if (dirtyFields.company_name) changes.company_name = company.company_name
      if (dirtyFields.currency) changes.currency = company.currency
      for (const [field] of accountFields) {
        if (!dirtyFields[field]) continue
        if (field === 'cogs_account' && !values[field]) changes[field] = null
        else changes[field] = Number(values[field])
      }
      return setupApi.update(changes)
    },
    onSuccess: (saved) => {
      reset(initialValues(saved))
      queryClient.setQueryData(['business-config'], saved)
      void queryClient.invalidateQueries({ queryKey: ['accounts'] })
      void queryClient.invalidateQueries({ queryKey: ['summary'] })
      showToast(config ? 'Business settings saved' : 'Business configured', 'success')
    },
  })

  return (
    <form onSubmit={handleSubmit(values => save.mutate(values))} className="max-w-2xl space-y-5 rounded-xl border border-gray-200 bg-white p-6">
      {!config && <p className="text-sm text-gray-600">Set your company name and currency. Setup creates your standard chart of accounts.</p>}
      <fieldset disabled={save.isPending} className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Company name
          <input className={inputClass} required maxLength={100} {...register('company_name')} />
        </label>
        <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
          Currency
          <input className={inputClass} required maxLength={10} {...register('currency')} />
        </label>
      </fieldset>
      {config && accounts.isPending && <p role="status" className="text-sm text-gray-500">Loading accounts…</p>}
      {config && accounts.isError && <p role="alert" className="text-sm text-red-600">{getErrorMessage(accounts.error)}</p>}
      {config && accounts.data && (
        <fieldset disabled={save.isPending} className="min-w-0 border-t border-gray-200 pt-4">
          <legend className="pr-3 text-sm font-semibold text-gray-900">Default accounts</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            {accountFields.map(([field, label]) => (
              <label key={field} className="flex min-w-0 flex-col gap-1 text-sm font-medium text-gray-700">
                {label}
                <select className={inputClass} required={field !== 'cogs_account'} {...register(field)}>
                  {field === 'cogs_account' && <option value="">None</option>}
                  {accounts.data.map(account => (
                    <option key={account.id} value={account.id}>{account.code} — {account.name}</option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {save.isError && <p role="alert" className="text-sm text-red-600">{getErrorMessage(save.error)}</p>}
      <button type="submit" disabled={save.isPending || !Object.keys(dirtyFields).length} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">
        {save.isPending ? 'Saving…' : config ? 'Save settings' : 'Set up business'}
      </button>
    </form>
  )
}

export default function Setup() {
  const config = useBusinessConfig()

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Business Setup" />
      {config.isPending && <p role="status" className="text-gray-500">Loading business settings…</p>}
      {config.isError && <p role="alert" className="text-red-600">{getErrorMessage(config.error)}</p>}
      {config.data !== undefined && <SetupForm key={config.data ? 'configured' : 'new'} config={config.data} />}
    </section>
  )
}
