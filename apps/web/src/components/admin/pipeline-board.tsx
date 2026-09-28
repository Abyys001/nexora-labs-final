"use client"

import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

import { enquiryKeys, fetchEnquiries } from "./api"
import { EmptyState, ErrorBlock, gbp, LoadingBlock, PageHeader, shortDate } from "./ui"
import { statusStyles } from "./status-badge"
import { enquiryStatuses, type EnquiryStatus } from "@/lib/enquiry"
import { cn } from "@/lib/utils"

const columnCopy: Record<EnquiryStatus, string> = {
  new: "Just arrived, not yet contacted",
  contacted: "We've replied and are waiting",
  qualified: "Scoped and worth pursuing",
  won: "Accepted and under way",
  lost: "Closed without a project",
  archived: "Parked or not relevant",
}

/** Kanban read of the request pipeline. Status changes happen on the request itself. */
export function PipelineBoard() {
  const query = useQuery({ queryKey: enquiryKeys.list({ page: 1, pageSize: 100 }), queryFn: () => fetchEnquiries({ page: 1, pageSize: 100 }) })

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Pipeline" description="Every open request by stage." />
        <LoadingBlock label="Loading pipeline" rows={3} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Pipeline" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }

  const items = query.data.items

  return (
    <>
      <PageHeader
        title="Pipeline"
        description="The 100 most recent requests, grouped by stage. Open a card to change its status, set a final price or draft a proposal."
      />
      {items.length === 0 ? (
        <EmptyState title="Nothing in the pipeline yet" description="Requests submitted through the Project Builder appear here." />
      ) : (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6">
          {enquiryStatuses.map((status) => {
            const column = items.filter((item) => item.status === status)
            const value = column.reduce((sum, item) => sum + (item.finalPriceGbp ?? item.estimateGbp ?? 0), 0)
            return (
              <section key={status} className="flex w-72 shrink-0 flex-col rounded-2xl border border-border bg-muted/40">
                <header className="border-b border-border px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset", statusStyles[status])}>
                      {status}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{column.length}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-muted-foreground">{columnCopy[status]}</p>
                  {value > 0 ? <p className="mt-1 font-mono text-xs">{gbp(value)}</p> : null}
                </header>
                <ul className="flex-1 space-y-2 p-3">
                  {column.length === 0 ? (
                    <li className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground">Empty</li>
                  ) : (
                    column.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={`/admin/requests/${item.id}`}
                          className="block rounded-xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
                        >
                          <p className="font-mono text-[0.65rem] text-muted-foreground">{item.reference ?? item.id.slice(0, 8)}</p>
                          <p className="mt-1 font-medium">{item.name}</p>
                          {item.company ? <p className="text-xs text-muted-foreground">{item.company}</p> : null}
                          <p className="mt-2 flex items-center justify-between gap-2 font-mono text-xs">
                            <span>{gbp(item.finalPriceGbp ?? item.estimateGbp)}</span>
                            <span className="text-muted-foreground">{shortDate(item.createdAt)}</span>
                          </p>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </section>
            )
          })}
        </div>
      )}
    </>
  )
}
