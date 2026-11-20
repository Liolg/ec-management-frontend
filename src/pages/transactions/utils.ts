import { useSearchParams } from 'react-router-dom'

export const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand disabled:bg-gray-100'

export const labelClass = 'flex flex-col gap-1 text-xs font-medium text-gray-500'

export const primaryButtonClass =
  'rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60'

export function today() {
  const date = new Date()
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

export function amountLabel(amount: string, currency?: string) {
  return currency ? `${currency} ${amount}` : amount
}

export function useTransactionDetailId() {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = Number(searchParams.get('id'))
  const detailId = Number.isInteger(value) && value > 0 ? value : null

  function setDetailId(id: number | null) {
    const next = new URLSearchParams(searchParams)
    if (id === null) next.delete('id')
    else next.set('id', String(id))
    setSearchParams(next, { replace: true })
  }

  return [detailId, setDetailId] as const
}
