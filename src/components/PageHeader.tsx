import type { ReactNode } from 'react'

interface Props {
  title: string
  action?: ReactNode
}

export default function PageHeader({ title, action }: Props) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
      {action}
    </div>
  )
}
