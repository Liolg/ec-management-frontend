import { useState, type FormEvent } from 'react'
import type { ReportPeriod } from '../types/business'

const inputClass = 'rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand'

export default function DateRangeFilter({ period, onChange }: {
  period: ReportPeriod
  onChange: (period: ReportPeriod) => void
}) {
  const [start, setStart] = useState(period.start ?? '')
  const [end, setEnd] = useState(period.end ?? '')
  const invalid = Boolean(start && end && start > end)

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!invalid) onChange({ start: start || undefined, end: end || undefined })
  }

  function clear() {
    setStart('')
    setEnd('')
    onChange({})
  }

  return (
    <form onSubmit={apply} aria-label="Filter by date" className="flex flex-col gap-2">
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          From
          <input type="date" className={inputClass} value={start} onChange={event => setStart(event.target.value)} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
          To
          <input type="date" className={inputClass} value={end} onChange={event => setEnd(event.target.value)} />
        </label>
        <button type="submit" disabled={invalid} className="rounded-lg bg-brand px-3 py-2 text-sm font-medium text-white hover:bg-brand-hover disabled:opacity-50">
          Apply
        </button>
        {(start || end || period.start || period.end) && (
          <button type="button" onClick={clear} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            Clear
          </button>
        )}
      </div>
      {invalid && <p role="alert" className="text-sm text-red-600">From must be on or before To.</p>}
    </form>
  )
}
