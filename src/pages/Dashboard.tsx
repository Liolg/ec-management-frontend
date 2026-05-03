import React, { useState } from 'react'
import { useBusinessSummary } from '../hooks/useBusinessSummary'
import { fmt } from '../lib/fmt'

export default function Dashboard() {
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [applied, setApplied] = useState<{ start?: string; end?: string }>({})

  const { data, isLoading, isError } = useBusinessSummary(
    applied.start || applied.end ? applied : undefined
  )

  const [showBanner, setShowBanner] = React.useState(
    () => !localStorage.getItem('ec_banner_dismissed')
  )

  function dismissBanner() {
    localStorage.setItem('ec_banner_dismissed', '1')
    setShowBanner(false)
  }

  function applyFilter() {
    setApplied({ start: start || undefined, end: end || undefined })
  }

  function clearFilter() {
    setStart('')
    setEnd('')
    setApplied({})
  }

  const hasFilter = applied.start || applied.end

  return (
    <div className="flex flex-col gap-6">
      {showBanner && (
        <div className="flex items-center justify-between bg-brand text-white rounded-xl px-5 py-3 text-sm font-medium">
          <span>Welcome back — your financial data is up to date.</span>
          <button onClick={dismissBanner} className="text-white/70 hover:text-white ml-4 text-lg leading-none">×</button>
        </div>
      )}

      <div className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-end gap-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">From</label>
            <input
              type="date"
              value={start}
              onChange={e => setStart(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500">To</label>
            <input
              type="date"
              value={end}
              onChange={e => setEnd(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            />
          </div>
          <button
            onClick={applyFilter}
            className="px-3 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply
          </button>
          {hasFilter && (
            <button
              onClick={clearFilter}
              className="px-3 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {isLoading && <p className="text-gray-500">Loading…</p>}
      {isError && <p className="text-red-500">Failed to load summary.</p>}

      {data && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Revenue', value: data.revenue },
            { label: 'Expenses', value: data.expenses },
            { label: 'Net Profit', value: data.net_profit },
            { label: 'Cash', value: data.cash_balance },
            { label: 'Receivables', value: data.receivables },
            { label: 'Payables', value: data.payables },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl px-6 py-5">
              <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-semibold text-gray-900">{fmt(value)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
