import { useState } from 'react'
import { useEntries } from '../hooks/useEntries'
import EntryForm from '../components/EntryForm'

export default function Entries() {
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, isError } = useEntries()

  if (isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (isError) return <p className="p-8 text-red-500">Failed to load entries.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Journal Entries</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Create journal entry</h2>
          <EntryForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {data?.length === 0 && (
          <p className="text-gray-500 text-sm">No entries yet.</p>
        )}
        {data?.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                <p className="text-xs text-gray-500">{entry.date}</p>
              </div>
              {entry.voided && (
                <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                  Voided
                </span>
              )}
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {entry.lines.map((line) => (
                  <tr key={line.id}>
                    <td className="px-6 py-2 text-gray-700">
                      {line.account.code} — {line.account.name}
                    </td>
                    <td className="px-4 py-2 text-gray-500 w-16">{line.type === 'D' ? 'Debit' : 'Credit'}</td>
                    <td className="px-6 py-2 text-gray-900 text-right w-32">{line.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
