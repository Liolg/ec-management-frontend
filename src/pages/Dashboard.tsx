import { useBusinessSummary } from '../hooks/useBusinessSummary'

export default function Dashboard() {
  const { data, isLoading, isError } = useBusinessSummary()

  if (isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (isError) return <p className="p-8 text-red-500">Failed to load summary.</p>

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      {data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Revenue', value: data.revenue },
            { label: 'Expenses', value: data.expenses },
            { label: 'Net Profit', value: data.net_profit },
            { label: 'Cash', value: data.cash_balance },
            { label: 'Receivable', value: data.receivable_balance },
            { label: 'Payable', value: data.payable_balance },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl px-6 py-5">
              <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
