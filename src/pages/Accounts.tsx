import { useState } from 'react'
import { useAccounts } from '../hooks/useAccounts'
import AccountForm from '../components/AccountForm'

export default function Accounts() {
  const [showForm, setShowForm] = useState(false)

  const { data, isLoading, isError } = useAccounts()

  if (isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (isError) return <p className="p-8 text-red-500">Failed to load accounts.</p>

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Accounts</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : 'New Account'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="text-base font-medium text-gray-900 mb-4">Create account</h2>
          <AccountForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{account.code}</td>
                <td className="px-6 py-4 text-gray-900">{account.name}</td>
                <td className="px-6 py-4 text-gray-500 capitalize">{account.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
