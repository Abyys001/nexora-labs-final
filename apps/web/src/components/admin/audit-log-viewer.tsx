"use client"

import { useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"

import { auditLogKeys, fetchAuditLogs, type AuditLogRow } from "./api"
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, Pill, shortDate, TableScroll } from "./ui"

const entities = ["", "proposal", "pricing_item", "pricing_multiplier", "pricing_settings", "currency", "payment", "payment_plan", "enquiry", "admin"] as const

const PAGE_SIZE = 25

const actionTone: Record<string, "neutral" | "positive" | "warning" | "danger"> = {
  create: "positive",
  update: "neutral",
  publish: "positive",
  accept: "positive",
  withdraw: "warning",
  cancel: "danger",
  refund: "danger",
  delete: "danger",
}

/** Read-only trail of every privileged change: who, what, when and why. */
export function AuditLogViewer() {
  const [entity, setEntity] = useState<string>("")
  const [page, setPage] = useState(1)
  const query = useQuery({
    queryKey: auditLogKeys.list(entity || undefined, page),
    queryFn: () => fetchAuditLogs({ entity: entity || undefined, page, pageSize: PAGE_SIZE }),
  })

  const totalPages = query.data ? Math.max(1, Math.ceil(query.data.total / PAGE_SIZE)) : 1

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Every price change, proposal transition, currency override and payment action, with the admin who made it and the reason they gave."
      />

      <div className="mb-5 flex flex-wrap gap-1.5">
        {entities.map((value) => (
          <button
            key={value || "all"}
            type="button"
            aria-pressed={value === entity}
            onClick={() => {
              setEntity(value)
              setPage(1)
            }}
            className={
              value === entity
                ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }
          >
            {value === "" ? "All" : value.replace(/_/g, " ")}
          </button>
        ))}
      </div>

      <Panel>
        {query.isPending ? (
          <LoadingBlock label="Loading audit log" rows={4} />
        ) : query.isError ? (
          <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
        ) : query.data.items.length === 0 ? (
          <EmptyState title="Nothing recorded yet" description="Entries appear as soon as an admin changes a price, publishes a proposal or records a payment." />
        ) : (
          <>
            <TableScroll>
              <table className="w-full min-w-[44rem] text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                    <th className="py-2 pr-4 font-medium">When</th>
                    <th className="py-2 pr-4 font-medium">Action</th>
                    <th className="py-2 pr-4 font-medium">Entity</th>
                    <th className="py-2 pr-4 font-medium">Reason</th>
                    <th className="py-2 font-medium">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {query.data.items.map((row) => (
                    <tr key={row.id} className="border-b border-border/60 align-top last:border-0">
                      <td className="py-3 pr-4 text-xs whitespace-nowrap text-muted-foreground">{shortDate(row.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <Pill tone={actionTone[row.action] ?? "neutral"}>{row.action}</Pill>
                      </td>
                      <td className="py-3 pr-4 text-xs">
                        <span className="font-medium">{row.entity.replace(/_/g, " ")}</span>
                        {row.entityId ? <span className="block font-mono text-[0.7rem] text-muted-foreground">{row.entityId.slice(0, 8)}</span> : null}
                      </td>
                      <td className="max-w-xs py-3 pr-4 text-xs text-muted-foreground">{row.reason ?? "—"}</td>
                      <td className="py-3 text-xs">
                        <ChangeSummary row={row} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>

            <nav className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4" aria-label="Audit log pages">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages} · {query.data.total} entries
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft data-icon="inline-start" /> Previous
                </Button>
                <Button size="sm" variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next <ChevronRight data-icon="inline-end" />
                </Button>
              </div>
            </nav>
          </>
        )}
      </Panel>
    </>
  )
}

/** Shows only the fields that actually changed, so a row stays readable. */
function ChangeSummary({ row }: { row: AuditLogRow }) {
  const before = (row.before ?? {}) as Record<string, unknown>
  const after = (row.after ?? {}) as Record<string, unknown>
  const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])]
    .filter((key) => !["createdAt", "updatedAt", "id"].includes(key))
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .slice(0, 4)

  if (keys.length === 0) return <span className="text-muted-foreground">—</span>

  return (
    <ul className="grid gap-0.5 font-mono text-[0.7rem]">
      {keys.map((key) => (
        <li key={key}>
          <span className="text-muted-foreground">{key}: </span>
          <span className="text-muted-foreground line-through">{format(before[key])}</span> → <span>{format(after[key])}</span>
        </li>
      ))}
    </ul>
  )
}

function format(value: unknown): string {
  if (value === null || value === undefined) return "—"
  if (typeof value === "object") return Array.isArray(value) ? `${value.length} items` : "{…}"
  const text = String(value)
  return text.length > 40 ? `${text.slice(0, 40)}…` : text
}
