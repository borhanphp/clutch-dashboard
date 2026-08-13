import { statusMeta } from '@/lib/status'

export default function StatusBadge({ status }: { status: string | null | undefined }) {
  const meta = statusMeta(status)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
      style={{ backgroundColor: meta.color }}
    >
      {meta.label}
    </span>
  )
}
