const decimalFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function fmt(value: string | number): string {
  if (typeof value === 'number') return decimalFormatter.format(value)
  return /^-?\d+(\.\d+)?$/.test(value)
    ? decimalFormatter.format(value as Intl.StringNumericLiteral)
    : value
}
