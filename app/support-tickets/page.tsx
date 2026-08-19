'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { TicketCounts, TicketListResponse, TicketStatus } from '@/lib/types'
import RequireAuth from '@/components/RequireAuth'
import AppHeader from '@/components/AppHeader'
import TicketStatusBadge from '@/components/TicketStatusBadge'

const STATUS_TABS: { value: TicketStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
]

const EMPTY_COUNTS: TicketCounts = { all: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 }

function fmtDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function SupportTicketsPage() {
  return (
    <RequireAuth>
      <TicketList />
    </RequireAuth>
  )
}

function TicketList() {
  const router = useRouter()
  const [tickets, setTickets] = useState<TicketListResponse['tickets']>([])
  const [counts, setCounts] = useState<TicketCounts>(EMPTY_COUNTS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<TicketStatus | ''>('')
  const [source, setSource] = useState('')
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api
      .get<TicketListResponse>('/admin/support-tickets', {
        params: {
          ...(status ? { status } : {}),
          ...(source ? { source } : {}),
        },
      })
      .then((response) => {
        setTickets(response.data.tickets ?? [])
        setCounts(response.data.counts ?? EMPTY_COUNTS)
      })
      .catch(() => setError('Failed to load support tickets.'))
      .finally(() => setLoading(false))
  }, [status, source])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return tickets
    return tickets.filter((ticket) =>
      [ticket.subject, ticket.name, ticket.email, ticket.message]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query)),
    )
  }, [tickets, search])

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Support Tickets</h1>
            <p className="mt-1 text-sm text-slate-500">
              Tickets submitted from the apps and the website.
            </p>
          </div>
          <input
            type="search"
            placeholder="Search subject, name, email…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === '' ? counts.all : counts[tab.value]
            const active = status === tab.value
            return (
              <button
                key={tab.label}
                onClick={() => setStatus(tab.value)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  active
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-slate-600 shadow-sm hover:bg-slate-50'
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 text-xs ${active ? 'text-white/80' : 'text-slate-400'}`}>
                  {count}
                </span>
              </button>
            )
          })}

          <select
            value={source}
            onChange={(event) => setSource(event.target.value)}
            className="ml-auto rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All sources</option>
            <option value="app">App</option>
            <option value="website">Website</option>
          </select>
        </div>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="rounded-lg bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            No support tickets found.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">From</th>
                  <th className="px-4 py-3">Organization</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => router.push(`/support-tickets/${ticket.id}`)}
                    className="cursor-pointer transition hover:bg-blue-50/50"
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium text-slate-900">#{ticket.id} {ticket.subject}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{ticket.message}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-900">{ticket.name}</p>
                      <p className="text-xs text-slate-500">{ticket.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {ticket.organization?.org_name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {ticket.source === 'app' ? 'App' : 'Website'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <TicketStatusBadge status={ticket.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-500">{fmtDate(ticket.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}
