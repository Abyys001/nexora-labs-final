"use client"

import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { ChevronLeft, ChevronRight, Inbox, RotateCcw, Search } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { budgets, enquiryStatuses, labelFor, projectTypes, type EnquiryStatus } from "@/lib/enquiry"
import { cn, formatDateTime } from "@/lib/utils"

import { enquiryKeys, fetchEnquiries, fetchStats, type EnquiryFilters } from "./api"
import { StatusBadge } from "./status-badge"

const PAGE_SIZE = 20

export function EnquiriesInbox() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const filters: EnquiryFilters = {
    status: searchParams.get("status") ?? undefined,
    source: searchParams.get("source") ?? undefined,
    q: searchParams.get("q") ?? undefined,
    page: Math.max(1, Number(searchParams.get("page")) || 1),
    pageSize: PAGE_SIZE,
  }

  const [search, setSearch] = useState(filters.q ?? "")

  function setParams(patch: Partial<Record<"status" | "source" | "q" | "page", string | undefined>>) {
    const params = new URLSearchParams(searchParams)
    for (const [k, v] of Object.entries(patch)) {
      if (v) params.set(k, v)
      else params.delete(k)
    }
    if (!("page" in patch)) params.delete("page")
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false })
  }

  // Debounce search so every keystroke doesn't trigger a request.
  useEffect(() => {
    if ((filters.q ?? "") === search.trim()) return
    const t = setTimeout(() => setParams({ q: search.trim() || undefined }), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const stats = useQuery({ queryKey: enquiryKeys.stats, queryFn: fetchStats })
  const list = useQuery({ queryKey: enquiryKeys.list(filters), queryFn: () => fetchEnquiries(filters), placeholderData: keepPreviousData })

  const totalPages = list.data ? Math.max(1, Math.ceil(list.data.total / list.data.pageSize)) : 1
  const tabs: { value?: EnquiryStatus; label: string; count?: number }[] = [
    { label: "All", count: stats.data?.total },
    ...enquiryStatuses.map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1), count: stats.data?.byStatus[s] ?? 0 })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Enquiries</h1>
          <p className="mt-1 text-sm text-muted-foreground">Contact form and quote requests from the website.</p>
        </div>
      </div>

      <div role="tablist" aria-label="Filter by status" className="flex gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1">
        {tabs.map((tab) => {
          const active = (filters.status ?? undefined) === tab.value
          return (
            <button
              key={tab.label}
              role="tab"
              aria-selected={active}
              onClick={() => setParams({ status: tab.value })}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-soft hover:text-foreground",
              )}
            >
              {tab.label}
              <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/20" : "bg-soft")}>
                {stats.isPending ? "·" : (tab.count ?? 0)}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search enquiries</span>
          <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email or company"
            className="h-11 w-full rounded-xl border border-input bg-card pr-4 pl-10 text-sm outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
          />
        </label>
        <label className="sm:w-48">
          <span className="sr-only">Filter by source</span>
          <select
            value={filters.source ?? ""}
            onChange={(e) => setParams({ source: e.target.value || undefined })}
            className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
          >
            <option value="">All sources</option>
            <option value="contact">Contact form</option>
            <option value="quote">Quote request</option>
          </select>
        </label>
      </div>

      <div className={cn("overflow-hidden rounded-2xl border border-border bg-card transition-opacity", list.isPlaceholderData && "opacity-60")}>
        {list.isError ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <p className="font-semibold">Couldn&apos;t load enquiries</p>
            <p className="mt-1 text-sm text-muted-foreground">{list.error.message}</p>
            <Button variant="outline" size="lg" className="mt-5" onClick={() => list.refetch()}><RotateCcw data-icon="inline-start" /> Retry</Button>
          </div>
        ) : list.isPending ? (
          <div className="space-y-px p-2" aria-busy="true" aria-label="Loading enquiries">
            {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
          </div>
        ) : list.data.items.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center">
            <span className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"><Inbox className="size-6" aria-hidden="true" /></span>
            <p className="mt-4 font-semibold">No enquiries found</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {filters.q || filters.status || filters.source ? "Try adjusting your filters." : "New website enquiries will appear here."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-soft hover:bg-soft">
                <TableHead className="px-4">Contact</TableHead>
                <TableHead className="hidden md:table-cell">Project</TableHead>
                <TableHead className="hidden lg:table-cell">Budget</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden px-4 text-right sm:table-cell">Received</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {list.data.items.map((e) => (
                <TableRow key={e.id} className="group relative">
                  <TableCell className="px-4 py-3.5">
                    <Link href={`/admin/requests/${e.id}`} className="font-semibold after:absolute after:inset-0 group-hover:text-primary">
                      {e.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{e.company ? `${e.company} · ` : ""}{e.email}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm">{labelFor(projectTypes, e.projectType)}</p>
                    <p className="text-xs text-muted-foreground capitalize">{e.source === "quote" ? "Quote request" : "Contact form"}</p>
                  </TableCell>
                  <TableCell className="hidden text-sm lg:table-cell">{labelFor(budgets, e.budget)}</TableCell>
                  <TableCell><StatusBadge status={e.status} /></TableCell>
                  <TableCell className="hidden px-4 text-right text-xs text-muted-foreground sm:table-cell">{formatDateTime(e.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {list.data && list.data.total > 0 ? (
        <nav aria-label="Pagination" className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            {list.data.total} {list.data.total === 1 ? "enquiry" : "enquiries"} · Page {filters.page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" disabled={filters.page <= 1} onClick={() => setParams({ page: String(filters.page - 1) })}>
              <ChevronLeft data-icon="inline-start" /> Previous
            </Button>
            <Button variant="outline" size="lg" disabled={filters.page >= totalPages} onClick={() => setParams({ page: String(filters.page + 1) })}>
              Next <ChevronRight data-icon="inline-end" />
            </Button>
          </div>
        </nav>
      ) : null}
    </div>
  )
}
