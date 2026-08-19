'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import type { ImpersonateResponse, OrgListItem, OrgListResponse } from '@/lib/types'
import { fmtCurrency, fmtNumber, fmtTonnage } from '@/lib/format'
import RequireAuth from '@/components/RequireAuth'
import AppHeader from '@/components/AppHeader'
import StatCard from '@/components/StatCard'

export default function OrganizationsPage() {
  return (
    <RequireAuth>
      <OrganizationsList />
    </RequireAuth>
  )
}

function OrganizationsList() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState<OrgListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [impersonating, setImpersonating] = useState<number | null>(null)
  const [impersonateError, setImpersonateError] = useState('')

  const loginAs = async (org: OrgListItem) => {
    setImpersonating(org.id)
    setImpersonateError('')
    try {
      const response = await api.post<ImpersonateResponse>(
        `/admin/organizations/${org.id}/impersonate`,
      )
      if (response.data.status && response.data.token) {
        const base = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'
        window.open(
          `${base}/sso?token=${encodeURIComponent(response.data.token)}`,
          '_blank',
          'noopener',
        )
      } else {
        setImpersonateError(response.data.message || 'Could not log in to that organization.')
      }
    } catch {
      setImpersonateError('Could not log in to that organization.')
    } finally {
      setImpersonating(null)
    }
  }

  useEffect(() => {
    api
      .get<OrgListResponse>('/admin/organizations')
      .then((response) => setOrganizations(response.data.organizations ?? []))
      .catch(() => setError('Failed to load organizations.'))
      .finally(() => setLoading(false))
  }, [])

  const totals = useMemo(
    () =>
      organizations.reduce(
        (acc, org) => ({
          loads: acc.loads + org.summary.total_loads,
          tonnage: acc.tonnage + org.summary.total_tonnage,
          revenue: acc.revenue + org.summary.total_revenue,
          contracts: acc.contracts + org.summary.total_contracts,
        }),
        { loads: 0, tonnage: 0, revenue: 0, contracts: 0 },
      ),
    [organizations],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return organizations
    return organizations.filter((org) =>
      [org.org_name, org.org_email, org.org_abn]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(query)),
    )
  }, [organizations, search])

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Organizations</h1>
            <p className="mt-1 text-sm text-slate-500">
              Select an organization to view its full operations summary.
            </p>
          </div>
          <input
            type="search"
            placeholder="Search by name, email or ABN…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard label="Organizations" value={fmtNumber(organizations.length)} />
          <StatCard label="Total Loads" value={fmtNumber(totals.loads)} />
          <StatCard label="Total Tonnage" value={fmtTonnage(totals.tonnage)} />
          <StatCard label="Total Revenue" value={fmtCurrency(totals.revenue)} />
          <StatCard label="Contracts" value={fmtNumber(totals.contracts)} />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        ) : error ? (
          <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : filtered.length === 0 ? (
          <p className="rounded-lg bg-white px-4 py-10 text-center text-sm text-slate-500 shadow-sm">
            No organizations found.
          </p>
        ) : (
          <>
            {impersonateError ? (
              <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                {impersonateError}
              </p>
            ) : null}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((org) => (
              <div
                key={org.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/organizations/${org.id}`)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    router.push(`/organizations/${org.id}`)
                  }
                }}
                className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900 group-hover:text-blue-700">
                      {org.org_name}
                    </h2>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {org.org_abn ? `ABN ${org.org_abn}` : 'No ABN'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      org.is_active === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {org.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  {org.org_email ? <p>{org.org_email}</p> : null}
                  {org.org_phone ? <p>{org.org_phone}</p> : null}
                </div>

                {org.companies.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {org.companies.map((company) => (
                      <span
                        key={company.id}
                        className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                      >
                        {company.company_name}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4 text-center">
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {fmtNumber(org.summary.total_loads)}
                    </p>
                    <p className="text-xs text-slate-500">Loads</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {fmtTonnage(org.summary.total_tonnage)}
                    </p>
                    <p className="text-xs text-slate-500">Tonnage</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {fmtCurrency(org.summary.total_revenue)}
                    </p>
                    <p className="text-xs text-slate-500">Revenue</p>
                  </div>
                  <div>
                    <p className="text-base font-semibold text-slate-900">
                      {fmtNumber(org.summary.total_contracts)}
                    </p>
                    <p className="text-xs text-slate-500">Contracts</p>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    disabled={impersonating === org.id}
                    onClick={(event) => {
                      event.stopPropagation()
                      loginAs(org)
                    }}
                    className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {impersonating === org.id ? 'Logging in…' : 'Login to Dashboard'}
                  </button>
                </div>
              </div>
            ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
