import { useId, useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface Props {
  title: string
  children: ReactNode
  onClose: () => void
  maxWidth?: string
  ariaDescribedBy?: string
}

export default function FormModal({
  title,
  children,
  onClose,
  maxWidth = 'max-w-xl',
  ariaDescribedBy,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [])

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={ariaDescribedBy}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      className={`m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] ${maxWidth} overflow-y-auto rounded-xl bg-transparent p-0 shadow-xl backdrop:bg-gray-900/50`}
    >
      <div className="bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-gray-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-xl leading-none text-gray-400 transition-colors hover:text-gray-600"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </dialog>
  )
}
