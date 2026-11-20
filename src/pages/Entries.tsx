import { useState } from 'react'
import { Pencil, Trash2, Ban } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAccounts } from '../hooks/useAccounts'
import { useEntries } from '../hooks/useEntries'
import { useVoidEntry } from '../hooks/useVoidEntry'
import { useDeleteEntry } from '../hooks/useDeleteEntry'
import EntryForm from '../components/EntryForm'
import ConfirmModal from '../components/ConfirmModal'
import FormModal from '../components/FormModal'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import { getErrorMessage } from '../lib/getErrorMessage'
import { fmt } from '../lib/fmt'
import type { Entry } from '../types/accounts'

export default function Entries() {
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [voiding, setVoiding] = useState<Entry | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)

  const { data, isLoading, isError } = useEntries()
  const accounts = useAccounts()
  const voidMutation = useVoidEntry()
  const deleteMutation = useDeleteEntry()
  const accountsById = new Map(accounts.data?.map(account => [account.id, account]))

  if (isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (isError) return <p className="p-8 text-red-500">Failed to load entries.</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Journal Entries"
        action={
          <button
            onClick={() => setShowCreate(true)}
            disabled={!accounts.data?.length}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            New Entry
          </button>
        }
      />
      {accounts.isError && <p role="alert" className="text-sm text-red-600">Failed to load account names.</p>}
      {accounts.data?.length === 0 && (
        <p className="text-sm text-gray-600">Create an account under <Link to="/accounts" className="text-brand underline">Accounts</Link> to post a journal entry.</p>
      )}

      {data?.length === 0 && (
        <EmptyState message="No journal entries yet." />
      )}

      <div className="flex flex-col gap-3">
        {data?.map((entry) => (
          <div key={entry.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <p className="text-sm font-medium text-gray-900">{entry.description}</p>
                <p className="text-xs text-gray-500">
                  {entry.date}
                  {entry.reference && <span className="ml-2 text-gray-400">· {entry.reference}</span>}
                  {entry.source && (
                    <Link to={`/transactions/${entry.source.type}s?id=${entry.source.id}`} className="ml-2 text-brand underline">
                      View {entry.source.type} #{entry.source.id}
                    </Link>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {entry.voided && (
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                    Voided
                  </span>
                )}
                {!entry.source && !entry.voided && (
                  <button
                    onClick={() => {
                      voidMutation.reset()
                      setVoiding(entry)
                    }}
                    className="text-gray-400 hover:text-amber-500 transition-colors"
                    title="Void entry"
                  >
                    <Ban size={14} />
                  </button>
                )}
                {!entry.source && !entry.voided && (
                  <button
                    onClick={() => setEditing(entry)}
                    className="text-gray-400 hover:text-brand transition-colors"
                    title="Edit entry"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                {!entry.source && (
                  <button
                    onClick={() => {
                      deleteMutation.reset()
                      setDeleting(entry)
                    }}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-gray-50">
                {entry.lines.map((line) => {
                  const account = accountsById.get(line.account)
                  const label = account ? `${account.code} — ${account.name}` : `Account #${line.account}`
                  return (
                    <tr key={line.id}>
                      <td className="px-6 py-2 text-gray-700">
                        <span>{label}</span>
                        {line.description && <span className="block text-xs text-gray-500">{line.description}</span>}
                      </td>
                      <td className="px-4 py-2 text-gray-500 w-16">{line.type === 'D' ? 'Debit' : 'Credit'}</td>
                      <td className="px-6 py-2 text-gray-900 text-right w-32">{fmt(line.value)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>

      {showCreate && (
        <FormModal title="Create journal entry" onClose={() => setShowCreate(false)} maxWidth="max-w-2xl">
          <EntryForm onSuccess={() => setShowCreate(false)} />
        </FormModal>
      )}

      {editing && (
        <FormModal title="Edit journal entry" onClose={() => setEditing(null)} maxWidth="max-w-2xl">
          <EntryForm
            entryId={editing.id}
            defaultEntry={editing}
            onSuccess={() => setEditing(null)}
          />
        </FormModal>
      )}

      {voiding && (
        <ConfirmModal
          title="Void entry"
          message={`Void the entry "${voiding.description}"? This will mark it as voided and cannot be undone.`}
          confirmLabel="Void"
          danger
          pending={voidMutation.isPending}
          error={voidMutation.isError ? getErrorMessage(voidMutation.error) : undefined}
          onConfirm={() => voidMutation.mutate(voiding.id, { onSuccess: () => setVoiding(null) })}
          onCancel={() => setVoiding(null)}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete entry"
          message={`Permanently delete "${deleting.description}"? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          pending={deleteMutation.isPending}
          error={deleteMutation.isError ? getErrorMessage(deleteMutation.error) : undefined}
          onConfirm={() => deleteMutation.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  )
}
