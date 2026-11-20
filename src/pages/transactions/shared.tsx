import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import FormModal from '../../components/FormModal'
import { getErrorMessage } from '../../lib/getErrorMessage'
import type { TransactionStatus } from '../../types/business'

export function StatusBadge({ status }: { status: TransactionStatus }) {
  const voided = status === 'voided'
  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
        voided ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'
      }`}
    >
      {voided ? 'Voided' : 'Confirmed'}
    </span>
  )
}

export function QueryError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
      <p>{message}</p>
      <button type="button" onClick={onRetry} className="mt-2 font-medium underline">
        Try again
      </button>
    </div>
  )
}

export function MutationError({ error }: { error: unknown }) {
  if (!error) return null
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
      {getErrorMessage(error)}
    </p>
  )
}

export function SetupRequired() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
      Business setup is required before recording transactions.{' '}
      <Link to="/setup" className="font-medium underline">
        Complete setup
      </Link>
    </div>
  )
}

export function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{children || '—'}</dd>
    </div>
  )
}

interface VoidDialogProps {
  label: string
  pending: boolean
  error: unknown
  onConfirm: () => void
  onCancel: () => void
}

export function VoidDialog({ label, pending, error, onConfirm, onCancel }: VoidDialogProps) {
  return (
    <FormModal title="Void transaction" onClose={pending ? () => undefined : onCancel} maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm leading-6 text-gray-600">
          Void {label}? The accounting entry will be voided and this cannot be undone.
        </p>
        <MutationError error={error} />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? 'Voiding…' : 'Void'}
          </button>
        </div>
      </div>
    </FormModal>
  )
}
