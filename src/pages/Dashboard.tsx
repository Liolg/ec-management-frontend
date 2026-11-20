import { useState } from 'react'
import { Link } from 'react-router-dom'
import DateRangeFilter from '../components/DateRangeFilter'
import PageHeader from '../components/PageHeader'
import { useBusinessConfig } from '../hooks/useBusinessConfig'
import { useBusinessSummary } from '../hooks/useBusinessSummary'
import { fmt } from '../lib/fmt'
import { getErrorMessage } from '../lib/getErrorMessage'
import type { ReportPeriod } from '../types/business'

function Metrics({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-3">
      {items.map(({ label, value }) => (
        <div key={label} className="rounded-xl border border-gray-200 bg-white px-6 py-5">
          <dt className="mb-1 text-xs font-medium text-gray-500">{label}</dt>
          <dd className="text-xl font-semibold tabular-nums text-gray-900">{fmt(value)}</dd>
        </div>
      ))}
    </dl>
  )
}

export default function Dashboard() {
  const [period, setPeriod] = useState<ReportPeriod>({})
  const { data, isPending, isError, error } = useBusinessSummary(period)
  const config = useBusinessConfig()
  const currency = config.data?.currency

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Dashboard" />
      {config.data === null && (
        <div className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-sm text-gray-700">
          <Link to="/setup" className="font-medium text-brand underline">Set up your business</Link> to map your accounts and record transactions.
        </div>
      )}
      <DateRangeFilter period={period} onChange={setPeriod} />
      {isPending && <p role="status" className="text-gray-500">Loading summary…</p>}
      {isError && <p role="alert" className="text-red-600">{getErrorMessage(error)}</p>}
      {data && (
        <>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Income and expenses{currency && ` (${currency})`}</h2>
            <Metrics items={[
              { label: 'Revenue', value: data.revenue },
              { label: 'Expenses', value: data.expenses },
              { label: 'Net profit', value: data.net_profit },
            ]} />
          </section>
          <section className="space-y-3">
            <h2 className="text-sm font-semibold text-gray-900">Current balances{currency && ` (${currency})`}</h2>
            <Metrics items={[
              { label: 'Cash', value: data.cash_balance },
              { label: 'Receivables', value: data.receivables },
              { label: 'Payables', value: data.payables },
            ]} />
          </section>
        </>
      )}
    </section>
  )
}
