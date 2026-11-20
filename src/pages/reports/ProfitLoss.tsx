import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../../api/business'
import DateRangeFilter from '../../components/DateRangeFilter'
import PageHeader from '../../components/PageHeader'
import { useBusinessConfig } from '../../hooks/useBusinessConfig'
import { fmt } from '../../lib/fmt'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { ProfitLossItem, ReportPeriod } from '../../types/business'

function Breakdown({ label, rows, total }: { label: string; rows: ProfitLossItem[]; total: string }) {
  return (
    <table className="w-full text-left text-sm">
      <caption className="border-b border-gray-200 bg-gray-50 px-5 py-3 text-left font-semibold text-gray-900">{label}</caption>
      <thead className="sr-only">
        <tr><th scope="col">Account</th><th scope="col">Amount</th></tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {rows.length === 0 && <tr><td colSpan={2} className="px-5 py-3 text-gray-500">No entries for this period.</td></tr>}
        {rows.map(row => (
          <tr key={row.account}>
            <th scope="row" className="px-5 py-3 font-normal text-gray-700">{row.account}</th>
            <td className="px-5 py-3 text-right tabular-nums">{fmt(row.amount)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t border-gray-200 font-semibold">
        <tr><th scope="row" className="px-5 py-3">Total</th><td className="px-5 py-3 text-right tabular-nums">{fmt(total)}</td></tr>
      </tfoot>
    </table>
  )
}

export default function ProfitLoss() {
  const [period, setPeriod] = useState<ReportPeriod>({})
  const config = useBusinessConfig()
  const report = useQuery({
    queryKey: ['profit-loss', period],
    queryFn: () => reportsApi.profitLoss(period),
  })

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Profit & Loss" />
      <DateRangeFilter period={period} onChange={setPeriod} />
      <p className="text-sm text-gray-600">
        This report uses posted journal entries. Sales move stock without automatically posting cost of goods sold.
      </p>
      {report.isPending && <p role="status" className="text-gray-500">Loading profit and loss…</p>}
      {report.isError && <p role="alert" className="text-red-600">{getErrorMessage(report.error)}</p>}
      {report.data && (
        <div className="max-w-4xl overflow-hidden rounded-xl border border-gray-200 bg-white">
          <Breakdown label="Revenue" rows={report.data.revenue} total={report.data.total_revenue} />
          <Breakdown label="Expenses" rows={report.data.expenses} total={report.data.total_expenses} />
          <dl className="flex justify-between gap-4 border-t border-gray-200 px-5 py-4 font-semibold text-gray-900">
            <dt>Net profit{config.data?.currency && ` (${config.data.currency})`}</dt>
            <dd className="tabular-nums">{fmt(report.data.net_profit)}</dd>
          </dl>
        </div>
      )}
    </section>
  )
}
