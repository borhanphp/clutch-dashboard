'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import type { SupportTicket, TicketDetailResponse, TicketStatus } from '@/lib/types'
import RequireAuth from '@/components/RequireAuth'
import AppHeader from '@/components/AppHeader'
import TicketStatusBadge from '@/components/TicketStatusBadge'

const STATUS_OPTIONS: TicketStatus[] = ['open', 'in_progress', 'resolved', 'closed']

function fmtDate(value: string | null) {
  if (!value) return '—'
  return new Date(value).toLocaleString()
}

export default function SupportTicketDetailPage() {
  return (
    <RequireAuth>
      <TicketDetail />
    </RequireAuth>
  )
}

function TicketDetail() {
  const params = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState<TicketStatus>('open')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  useEffect(() => {
    if (!params.id) return
    api
      .get<TicketDetailResponse>(`/admin/support-tickets/${params.id}`)
      .then((response) => {
        if (response.data.status) {
          setTicket(response.data.ticket)
          setStatus(response.data.ticket.status)
          setNotes(response.data.ticket.admin_notes ?? '')
        } else {
          setError(
            typeof response.data.message === 'string'
              ? response.data.message
              : 'Ticket not found.',
          )
        }
      })
      .catch(() => setError('Failed to load support ticket.'))
      .finally(() => setLoading(false))
  }, [params.id])

  const save = async () => {
    if (!ticket) return
    setSaving(true)
    setSaveMessage('')
    try {
      const response = await api.patch<TicketDetailResponse>(
        `/admin/support-tickets/${ticket.id}`,
        { status, admin_notes: notes || null },
      )
      if (response.data.status) {
        setTicket(response.data.ticket)
        setSaveMessage('Saved.')
      } else {
        setSaveMessage(
          typeof response.data.message === 'string' ? response.data.message : 'Save failed.',
        )
      }
    } catch {
      setSaveMessage('Save failed.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <Link href="/support-tickets" className="text-sm text-blue-600 hover:underline">
          ← Back to Support Tickets
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        ) : error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : ticket ? (
          <div className="mt-4 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-semibold text-slate-900">
                    #{ticket.id} {ticket.subject}
                  </h1>
                  <p className="mt-1 text-sm text-slate-500">
                    {ticket.name} · {ticket.email}
                    {ticket.organization?.org_name
                      ? ` · ${ticket.organization.org_name}`
                      : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                    {ticket.source === 'app' ? 'App' : 'Website'}
                  </span>
                  <TicketStatusBadge status={ticket.status} />
                </div>
              </div>

              <div className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                {ticket.message}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500 sm:grid-cols-3">
                <p>Created: {fmtDate(ticket.created_at)}</p>
                <p>Updated: {fmtDate(ticket.updated_at)}</p>
                {ticket.user ? (
                  <p>
                    App user:{' '}
                    {[ticket.user.first_name, ticket.user.last_name].filter(Boolean).join(' ') ||
                      ticket.user.username}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Manage ticket</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">Status</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value as TicketStatus)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  Internal notes (not shown to the reporter)
                </label>
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Add internal notes…"
                />
              </div>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
                {saveMessage ? (
                  <span className="text-sm text-slate-500">{saveMessage}</span>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  )
}
