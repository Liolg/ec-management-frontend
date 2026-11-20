interface Props {
  message: string
}

export default function EmptyState({ message }: Props) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  )
}
