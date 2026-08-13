'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import api from '@/lib/api'
import type { OrgDetailResponse } from '@/lib/types'
import { fmtCurrency, fmtDate, fmtKms, fmtMonth, fmtNumber, fmtTonnage, toNumber } from '@/lib/format'
import { statusMeta } from '@/lib/status'
import RequireAuth from '@/components/RequireAuth'
import AppHeader from '@/components/AppHeader'
import StatCard from '@/components/StatCard'
import StatusBadge from '@/components/StatusBadge'

export default function OrganizationDetailPage() {
  return (
    <RequireAuth>
      <OrganizationDetail />
    </RequireAuth>
  )
}

function OrganizationDetail() {
  const params = useParams<{ id: string }>()
  const [data, setData] = useState<OrgDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!params.id) return
    setLoading(true)
    api
      .get<OrgDetailResponse>(`/admin/organizations/${params.id}`)
      .then((response) => {
        if (response.data.status) {
          setData(response.data)
        } else {
          setError(
            typeof response.data.message === 'string'
              ? response.data.message
              : 'Organization not found.',
          )
        }
      })
      .catch(() => setError('Failed to load organization summary.'))
      .finally(() => setLoading(false))
  }, [params.id])

  const maxStatusCount = useMemo(
    () => Math.max(1, ...(data?.status_breakdown.map((row) => row.count) ?? [1])),
    [data],
  )
  const maxMonthlyLoads = useMemo(
    () => Math.max(1, ...(data?.monthly_trend.map((row) => row.loads) ?? [1])),
    [data],
  )

  return (
    <div className="min-h-screen">
      <AppHeader />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Link href="/" className="text-sm text-blue-600 hover:underline">
          ← Back to organizations
        </Link>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
          </div>
        ) : error ? (
          <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        ) : data ? (
          <div className="mt-4 space-y-6">
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {data.organization.org_name}
                  </h1>
                  <div className="mt-1 space-y-0.5 text-sm text-slate-500">
                    {data.organization.org_abn ? <p>ABN {data.organization.org_abn}</p> : null}
                    {data.organization.org_email ? <p>{data.organization.org_email}</p> : null}
                    {data.organization.org_phone ? <p>{data.organization.org_phone}</p> : null}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      data.organization.is_active === 1
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {data.organization.is_active === 1 ? 'Active' : 'Inactive'}
                  </span>
                  <p className="mt-2 text-xs text-slate-400">
                    Member since {fmtDate(data.organization.created_at)}
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
              <StatCard label="Total Loads" value={fmtNumber(data.summary.total_loads)} />
              <StatCard label="Total Tonnage" value={fmtTonnage(data.summary.total_tonnage)} />
              <StatCard label="Total Revenue" value={fmtCurrency(data.summary.total_revenue)} />
              <StatCard label="Total KMs" value={fmtKms(data.summary.total_kms)} />
              <StatCard
                label="Contracts"
                value={fmtNumber(data.summary.total_contracts)}
                hint={`${fmtNumber(data.summary.active_contracts)} active`}
              />
              <StatCard label="Companies" value={fmtNumber(data.summary.companies_count)} />
              <StatCard label="Drivers" value={fmtNumber(data.summary.drivers_count)} />
              <StatCard label="Customers" value={fmtNumber(data.summary.customers_count)} />
              <StatCard label="Assets" value={fmtNumber(data.summary.assets_count)} />
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">Loads by Status</h2>
                {data.status_breakdown.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No loads recorded.</p>
                ) : (
                  <div className="space-y-3">
                    {data.status_breakdown.map((row) => {
                      const meta = statusMeta(row.status)
                      return (
                        <div key={row.status ?? 'unknown'}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="font-medium text-slate-700">{meta.label}</span>
                            <span className="text-slate-500">
                              {fmtNumber(row.count)} loads · {fmtTonnage(row.tonnage)} ·{' '}
                              {fmtCurrency(row.revenue)}
                            </span>
                          </div>
                          <div className="h-2.5 w-full rounded-full bg-slate-100">
                            <div
                              className="h-2.5 rounded-full"
                              style={{
                                width: `${Math.max(3, (row.count / maxStatusCount) * 100)}%`,
                                backgroundColor: meta.color,
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="mb-4 text-base font-semibold text-slate-900">
                  Monthly Loads — last 12 months
                </h2>
                {data.monthly_trend.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">No loads recorded.</p>
                ) : (
                  <div className="flex h-44 items-end gap-2">
                    {data.monthly_trend.map((row) => (
                      <div key={row.month} className="flex flex-1 flex-col items-center gap-1">
                        <span className="text-xs font-medium text-slate-600">
                          {fmtNumber(row.loads)}
                        </span>
                        <div
                          className="w-full rounded-t bg-blue-500/80"
                          style={{
                            height: `${Math.max(4, (row.loads / maxMonthlyLoads) * 110)}px`,
                          }}
                          title={`${fmtMonth(row.month)} — ${fmtNumber(row.loads)} loads, ${fmtTonnage(row.tonnage)}, ${fmtCurrency(row.revenue)}`}
                        />
                        <span className="text-[10px] text-slate-400">{fmtMonth(row.month)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Companies ({data.companies.length})
              </h2>
              {data.companies.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">No companies in this organization.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2 font-medium">Company</th>
                        <th className="px-3 py-2 font-medium">ABN</th>
                        <th className="px-3 py-2 font-medium">Contact</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 text-right font-medium">Loads</th>
                        <th className="px-3 py-2 text-right font-medium">Tonnage</th>
                        <th className="px-3 py-2 text-right font-medium">Revenue</th>
                        <th className="px-3 py-2 text-right font-medium">Contracts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.companies.map((company) => (
                        <tr key={company.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2.5 font-medium text-slate-800">
                            {company.company_name}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">{company.company_abn ?? '—'}</td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {company.company_email ?? company.company_phone ?? '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                company.is_active === 1
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {company.is_active === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {fmtNumber(company.total_loads)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {fmtTonnage(company.total_tonnage)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {fmtCurrency(company.total_revenue)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {fmtNumber(company.active_contracts)} / {fmtNumber(company.total_contracts)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Contracts / Orders ({data.contracts.length})
              </h2>
              {data.contracts.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">No contracts for this organization.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2 font-medium">Contract</th>
                        <th className="px-3 py-2 font-medium">Customer</th>
                        <th className="px-3 py-2 font-medium">Commodity</th>
                        <th className="px-3 py-2 font-medium">Route</th>
                        <th className="px-3 py-2 font-medium">Period</th>
                        <th className="px-3 py-2 text-right font-medium">Est. Tonnage</th>
                        <th className="px-3 py-2 text-right font-medium">Rate</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.contracts.map((contract) => (
                        <tr key={contract.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-slate-800">
                              {contract.contract_name ?? contract.contract_no ?? `#${contract.id}`}
                            </p>
                            {contract.contract_no ? (
                              <p className="text-xs text-slate-400">{contract.contract_no}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {contract.customer?.company_name ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {contract.commodity_type?.name ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {contract.pickup_location ?? '—'} → {contract.dropoff_location ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {fmtDate(contract.start_date)} – {fmtDate(contract.end_date)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {contract.estimated_tonnage
                              ? fmtTonnage(contract.estimated_tonnage)
                              : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {contract.contract_rate
                              ? `$${fmtNumber(toNumber(contract.contract_rate), 2)}`
                              : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                contract.is_active === 1
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {contract.is_active === 1 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">
                Recent Loads ({data.recent_loads.length})
              </h2>
              {data.recent_loads.length === 0 ? (
                <p className="py-4 text-sm text-slate-500">No loads recorded for this organization.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2 font-medium">Date</th>
                        <th className="px-3 py-2 font-medium">Load</th>
                        <th className="px-3 py-2 font-medium">Contract</th>
                        <th className="px-3 py-2 font-medium">Customer</th>
                        <th className="px-3 py-2 font-medium">Driver</th>
                        <th className="px-3 py-2 font-medium">Asset</th>
                        <th className="px-3 py-2 font-medium">Route</th>
                        <th className="px-3 py-2 text-right font-medium">Tonnage</th>
                        <th className="px-3 py-2 text-right font-medium">Rate</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recent_loads.map((load) => (
                        <tr key={load.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                            {fmtDate(load.load_start_date)}
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="font-medium text-slate-800">
                              {load.delivery_no ?? load.release_no ?? `#${load.id}`}
                            </p>
                            {load.commodity_type?.name ? (
                              <p className="text-xs text-slate-400">{load.commodity_type.name}</p>
                            ) : null}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {load.contract?.contract_name ?? load.contract?.contract_no ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {load.customer?.company_name ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {load.driver
                              ? [load.driver.first_name, load.driver.last_name]
                                  .filter(Boolean)
                                  .join(' ') || '—'
                              : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {load.asset?.registration_no ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            {load.pickup_location ?? '—'} → {load.dropoff_location ?? '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {load.tonnage ? fmtTonnage(load.tonnage) : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {load.load_rate ? `$${fmtNumber(toNumber(load.load_rate), 2)}` : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusBadge status={load.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-slate-900">Stripe Payments</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <h3 className="text-sm font-medium text-slate-700">Subscription</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${subscriptionBadgeClass(data.billing.subscription.subscription_status)}`}
                    >
                      {data.billing.subscription.subscription_status ?? 'none'}
                    </span>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <BillingRow
                      label="Stripe Customer"
                      value={data.billing.subscription.stripe_customer_id}
                    />
                    <BillingRow
                      label="Subscription ID"
                      value={data.billing.subscription.stripe_subscription_id}
                    />
                    <BillingRow
                      label="Bill Rate"
                      value={
                        data.billing.subscription.bill_rate
                          ? `$${fmtNumber(toNumber(data.billing.subscription.bill_rate), 2)} / truck`
                          : null
                      }
                    />
                    <BillingRow
                      label="Currency"
                      value={data.billing.subscription.currency?.toUpperCase()}
                    />
                    <BillingRow
                      label="Days Until Due"
                      value={
                        data.billing.subscription.days_until_due != null
                          ? fmtNumber(data.billing.subscription.days_until_due)
                          : null
                      }
                    />
                    <BillingRow
                      label="Billable"
                      value={data.billing.subscription.is_billable === 1 ? 'Yes' : 'No'}
                    />
                    {data.billing.subscription.coupon_code ? (
                      <BillingRow
                        label="Coupon"
                        value={`${data.billing.subscription.coupon_code}${data.billing.subscription.coupon_redeemed ? ' (redeemed)' : ''}`}
                      />
                    ) : null}
                  </dl>
                </div>

                <div>
                  <h3 className="mb-3 text-sm font-medium text-slate-700">Saved Cards</h3>
                  {data.billing.payment_methods.length === 0 ? (
                    <p className="text-sm text-slate-500">No payment methods on file.</p>
                  ) : (
                    <ul className="space-y-2">
                      {data.billing.payment_methods.map((method) => (
                        <li
                          key={method.id}
                          className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-slate-800">
                            {(method.brand ?? 'card').toUpperCase()} ···· {method.last4 ?? '????'}
                          </span>
                          <span className="flex items-center gap-2 text-xs text-slate-500">
                            {method.exp_month != null && method.exp_year != null
                              ? `exp ${String(method.exp_month).padStart(2, '0')}/${method.exp_year}`
                              : null}
                            {method.is_default ? (
                              <span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-blue-700">
                                Default
                              </span>
                            ) : null}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <h3 className="mb-3 mt-6 text-sm font-medium text-slate-700">
                Invoices ({data.billing.bills.length})
              </h3>
              {data.billing.bills.length === 0 ? (
                <p className="text-sm text-slate-500">No invoices for this organization.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-3 py-2 font-medium">Billing Period</th>
                        <th className="px-3 py-2 text-right font-medium">Trucks</th>
                        <th className="px-3 py-2 text-right font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.billing.bills.map((bill) => (
                        <tr key={bill.id} className="border-b border-slate-100 last:border-0">
                          <td className="px-3 py-2.5 whitespace-nowrap text-slate-600">
                            {fmtDate(bill.billing_period_start)} – {fmtDate(bill.billing_period_end)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {fmtNumber(bill.total_active_trucks)}
                          </td>
                          <td className="px-3 py-2.5 text-right text-slate-800">
                            {bill.total_amount != null
                              ? `$${fmtNumber(toNumber(bill.total_amount), 2)}`
                              : '—'}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${billBadgeClass(bill.status)}`}
                            >
                              {bill.status ?? 'unknown'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-slate-600">
                            <div className="flex gap-3">
                              {bill.hosted_invoice_url ? (
                                <a
                                  href={bill.hosted_invoice_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  View
                                </a>
                              ) : null}
                              {bill.invoice_pdf ? (
                                <a
                                  href={bill.invoice_pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  PDF
                                </a>
                              ) : null}
                              {!bill.hosted_invoice_url && !bill.invoice_pdf ? '—' : null}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </main>
    </div>
  )
}

function BillingRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">{label}</dt>
      <dd className="break-all text-right font-medium text-slate-800">{value || '—'}</dd>
    </div>
  )
}

function subscriptionBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'bg-green-100 text-green-700'
    case 'past_due':
    case 'incomplete':
      return 'bg-amber-100 text-amber-700'
    case 'unpaid':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-200 text-slate-600'
  }
}

function billBadgeClass(status: string | null | undefined): string {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-700'
    case 'failed':
      return 'bg-red-100 text-red-700'
    case 'pending':
      return 'bg-amber-100 text-amber-700'
    default:
      return 'bg-slate-200 text-slate-600'
  }
}
