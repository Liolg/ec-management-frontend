import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useAccounts } from '../hooks/useAccounts'
import { useDeleteAccount } from '../hooks/useDeleteAccount'
import AccountForm from '../components/AccountForm'
import ConfirmModal from '../components/ConfirmModal'
import FormModal from '../components/FormModal'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import type { Account } from '../types/accounts'

export default function Accounts() {
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)
  const [deleting, setDeleting] = useState<Account | null>(null)

  const { data, isLoading, isError } = useAccounts()
  const deleteMutation = useDeleteAccount()

  if (isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (isError) return <p className="p-8 text-red-500">Failed to load accounts.</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Accounts"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            New Account
          </button>
        }
      />

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Code</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Type</th>
              <th className="px-6 py-3 w-20" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.length === 0 && (
              <tr>
                <td colSpan={4}>
                  <EmptyState message="No accounts yet. Create one to get started." />
                </td>
              </tr>
            )}
            {data?.map((account) => (
              <tr key={account.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-500">{account.code}</td>
                <td className="px-6 py-4 text-gray-900">{account.name}</td>
                <td className="px-6 py-4 text-gray-500 capitalize">{account.type}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => setEditing(account)}
                      className="text-gray-400 hover:text-brand transition-colors"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => setDeleting(account)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <FormModal title="Create account" onClose={() => setShowCreate(false)}>
          <AccountForm onSuccess={() => setShowCreate(false)} />
        </FormModal>
      )}

      {editing && (
        <FormModal title="Edit account" onClose={() => setEditing(null)}>
          <AccountForm
            accountId={editing.id}
            defaultValues={{
              code: editing.code,
              name: editing.name,
              type: editing.type as 'asset' | 'liability' | 'equity' | 'income' | 'expense',
            }}
            onSuccess={() => setEditing(null)}
          />
        </FormModal>
      )}

      {deleting && (
        <ConfirmModal
          title="Delete account"
          message={`Delete "${deleting.name}"? This cannot be undone. Accounts in use by journal entries cannot be deleted.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => {
            deleteMutation.mutate(deleting.id)
            setDeleting(null)
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
