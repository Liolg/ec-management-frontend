import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../../api/business'
import EmptyState from '../../components/EmptyState'
import PageHeader from '../../components/PageHeader'
import { useBusinessConfig } from '../../hooks/useBusinessConfig'
import { fmt } from '../../lib/fmt'
import { getErrorMessage } from '../../lib/getErrorMessage'

export default function InventoryReport() {
  const config = useBusinessConfig()
  const report = useQuery({ queryKey: ['inventory'], queryFn: reportsApi.inventory })
  const currency = config.data?.currency

  return (
    <section className="flex flex-col gap-6">
      <PageHeader title="Inventory" />
      <p className="text-sm text-gray-600">Estimated value uses current stock and the average recorded cost of incoming stock movements.</p>
      {report.isPending && <p role="status" className="text-gray-500">Loading inventory…</p>}
      {report.isError && <p role="alert" className="text-red-600">{getErrorMessage(report.error)}</p>}
      {report.data && (
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          {report.data.length === 0 ? <EmptyState message="No products to report. Add a product to track its inventory." /> : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-600">
                <tr>
                  <th scope="col" className="px-5 py-3">Product</th>
                  <th scope="col" className="px-5 py-3 text-right">Current stock</th>
                  <th scope="col" className="px-5 py-3 text-right">Unit cost{currency && ` (${currency})`}</th>
                  <th scope="col" className="px-5 py-3 text-right">Estimated value{currency && ` (${currency})`}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {report.data.map((row, index) => (
                  <tr key={`${row.product}-${index}`} className="tabular-nums">
                    <th scope="row" className="px-5 py-3 font-medium">{row.product}</th>
                    <td className="px-5 py-3 text-right">{row.current_stock}</td>
                    <td className="px-5 py-3 text-right">{fmt(row.unit_cost)}</td>
                    <td className="px-5 py-3 text-right">{fmt(row.stock_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}
