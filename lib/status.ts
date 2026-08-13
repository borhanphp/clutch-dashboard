export const LOAD_STATUS: Record<string, { label: string; color: string }> = {
  '1': { label: 'Planning', color: '#6366f1' },
  '2': { label: 'Allocated', color: '#0ea5e9' },
  '3': { label: 'Loading', color: '#f59e0b' },
  '4': { label: 'Delivered', color: '#22c55e' },
  '5': { label: 'Cancelled', color: '#ef4444' },
  '6': { label: 'ADHOC', color: '#a855f7' },
  '7': { label: 'Invoice Queued', color: '#eab308' },
  '8': { label: 'Invoiced', color: '#10b981' },
}

export function statusMeta(status: string | null | undefined) {
  if (!status) return { label: 'Unknown', color: '#94a3b8' }
  return LOAD_STATUS[status] ?? { label: 'Unknown', color: '#94a3b8' }
}
