export function toNumber(value: number | string | null | undefined): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function fmtNumber(value: number | string | null | undefined, decimals = 0): string {
  return toNumber(value).toLocaleString('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function fmtCurrency(value: number | string | null | undefined): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    maximumFractionDigits: 0,
  }).format(toNumber(value))
}

export function fmtTonnage(value: number | string | null | undefined): string {
  const n = toNumber(value)
  return `${fmtNumber(n, n % 1 !== 0 ? 2 : 0)} t`
}

export function fmtKms(value: number | string | null | undefined): string {
  return `${fmtNumber(value)} km`
}

export function fmtDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function fmtMonth(value: string): string {
  const date = new Date(`${value}-01T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-AU', { month: 'short', year: '2-digit' })
}
