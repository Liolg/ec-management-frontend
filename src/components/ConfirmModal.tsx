import { useId } from 'react'
import FormModal from './FormModal'

interface Props {
  title: string
  message: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  danger?: boolean
  pending?: boolean
  error?: string
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  danger = false,
  pending = false,
  error,
}: Props) {
  const messageId = useId()

  return (
    <FormModal
      title={title}
      onClose={() => {
        if (!pending) onCancel()
      }}
      maxWidth="max-w-md"
      ariaDescribedBy={messageId}
    >
      <p id={messageId} className="text-sm leading-6 text-gray-600">
        {message}
      </p>
      {error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={onCancel}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={onConfirm}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 ${
            danger
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-brand hover:bg-brand-hover'
          }`}
        >
          {pending ? 'Working…' : confirmLabel}
        </button>
      </div>
    </FormModal>
  )
}
