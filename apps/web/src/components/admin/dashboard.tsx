"use client"

import { useQuery } from "@tanstack/react-query"
import { ArrowRight, Inbox, TrendingUp, Wallet } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { dashboardKeys, fetchDashboard } from "./api"
import { StatusBadge } from "./status-badge"
import { ErrorBlock, EmptyState, gbp, LoadingBlock, PageHeader, Panel, shortDate, StatTile, TableScroll } from "./ui"

const statusOrder = ["new", "contacted", "qualified", "won", "lost", "archived"] as const

export function AdminDashboard() {
  const query = useQuery({ queryKey: dashboardKeys.summary, queryFn: fetchDashboard })

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Dashboard" description="Live view of requests, pipeline value and outstanding payments." />
        <LoadingBlock label="Loading dashboard" rows={4} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Dashboard" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }

  const data = query.data
  const open = (data.byStatus.new ?? 0) + (data.byStatus.contacted ?? 0) + (data.byStatus.qualified ?? 0)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Live view of requests, pipeline value and outstanding payments. Every figure here comes from the database, not a cached snapshot."
        action={
          <Button asChild size="lg">
            <Link href="/admin/requests">
              <Inbox data-icon="inline-start" /> All requests
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Open requests" value={open} hint="New, contacted or qualified" />
        <StatTile label="Pipeline value" value={gbp(data.pipelineValueGbp)} hint="Final price where set, estimate otherwise" />
        <StatTile label="Outstanding payments" value={gbp(data.outstandingPaymentsGbp)} tone={data.outstandingPaymentsGbp > 0 ? "warning" : "default"} />
        <StatTile label="Overdue instalments" value={data.overdueCount} tone={data.overdueCount > 0 ? "warning" : "positive"} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-start">
        <Panel
          title="Recent requests"
          description="The ten most recent project requests."
          action={
            <Button asChild variant="ghost" size="lg">
              <Link href="/admin/requests">
                View all <ArrowRight data-icon="inline-end" />
              </Link>
            </Button>
          }
        >
          {data.recentRequests.length === 0 ? (
            <EmptyState title="No requests yet" description="Requests submitted through the Project Builder land here." />
          ) : (
            <TableScroll>
              <table className="w-full min-w-[40rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                    <th className="py-2 pr-4 font-medium">Reference</th>
                    <th className="py-2 pr-4 font-medium">Client</th>
                    <th className="py-2 pr-4 font-medium">Value</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                    <th className="py-2 font-medium">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentRequests.map((row) => (
                    <tr key={row.id} className="group border-b border-border/60 last:border-0">
                      <td className="relative py-3 pr-4 font-mono text-xs">
                        <Link href={`/admin/requests/${row.id}`} className="font-semibold after:absolute after:inset-0 group-hover:text-primary">
                          {row.reference ?? row.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="font-medium">{row.name}</span>
                        {row.company ? <span className="block text-xs text-muted-foreground">{row.company}</span> : null}
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs">
                        {gbp(row.finalPriceGbp ?? row.estimateGbp)}
                        {row.finalPriceGbp !== null ? <span className="ml-1.5 text-[0.65rem] text-emerald-600">final</span> : null}
                      </td>
                      <td className="py-3 pr-4">
                        <StatusBadge status={row.status as (typeof statusOrder)[number]} />
                      </td>
                      <td className="py-3 text-xs text-muted-foreground">{shortDate(row.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="By status">
            <ul className="grid gap-2.5">
              {statusOrder.map((status) => (
                <li key={status} className="flex items-center justify-between gap-3 text-sm">
                  <StatusBadge status={status} />
                  <span className="font-mono">{data.byStatus[status] ?? 0}</span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Shortcuts">
            <div className="grid gap-2">
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/admin/proposals">
                  <TrendingUp data-icon="inline-start" /> Proposals
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="justify-start">
                <Link href="/admin/payments">
                  <Wallet data-icon="inline-start" /> Payments
                </Link>
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    </>
  )
}
