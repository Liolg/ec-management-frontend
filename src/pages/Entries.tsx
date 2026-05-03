import { useState } from 'react'
import { Pencil, Trash2, Ban } from 'lucide-react'
import { useEntries } from '../hooks/useEntries'
import { useVoidEntry } from '../hooks/useVoidEntry'
import { useDeleteEntry } from '../hooks/useDeleteEntry'
import EntryForm from '../components/EntryForm'
import ConfirmModal from '../components/ConfirmModal'
import FormModal from '../components/FormModal'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import type { Entry } from '../types/accounts'

export default function Entries() {
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Entry | null>(null)
  const [voiding, setVoiding] = useState<Entry | null>(null)
  const [deleting, setDeleting] = useState<Entry | null>(null)

  const { data, isLoading, isError } = useEntries()
  const voidMutation = useVoidEntry()
  const deleteMutation = useDeleteEntry()

  if (isLoading) return <p className="p-8 text-gray-500">Loading…</p>
  if (isError) return <p className="p-8 text-red-500">Failed to load entries.</p>

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Journal Entries"
        action={
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
          >
            New Entry
          </button>
        }
      />

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
                </p>
              </div>
              <div className="flex items-center gap-3">
                {entry.voided && (
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                    Voided
                  </span>
                )}
                {!entry.voided && (
                  <button
                    onClick={() => setVoiding(entry)}
                    className="text-gray-400 hover:text-amber-500 transition-colors"
                    title="Void entry"
                  >
                    <Ban size={14} />
                  </button>
                )}
                {!entry.voided && (
                  <button
                    onClick={() => setEditing(entry)}
                    className="text-gray-400 hover:text-brand transition-colors"
                    title="Edit entry"
                  >
                    <Pencil size={14} />
                  </button>
                )}
                <button
                  onClick={() => setDeleting(entry)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete entry"
                >
                  <Trash2 size={14} />
                </button>
              </div>
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
          onConfirm={() => {
            voidMutation.mutate(voiding.id)
            setVoiding(null)
          }}
          onCancel={() => setVoiding(null)}
        />
      )}

      {deleting && (
        <ConfirmModal
          title="Delete entry"
          message={`Permanently delete "${deleting.description}"? This cannot be undone.`}
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
