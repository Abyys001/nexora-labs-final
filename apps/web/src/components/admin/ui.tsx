"use client"

import { AlertCircle, Loader2, RotateCcw } from "lucide-react"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

import { ApiError } from "./api"

const gbpFormat = new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 })

export const gbp = (amount: number | null | undefined) => (amount === null || amount === undefined ? "—" : gbpFormat.format(amount))

export function money(amount: number | null | undefined, currency: string): string {
  if (amount === null || amount === undefined) return "—"
  return new Intl.NumberFormat(currency === "USD" ? "en-US" : currency === "EUR" ? "de-DE" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount)
}

export function shortDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00.000Z` : iso)
  if (Number.isNaN(date.getTime())) return "—"
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(date)
}

export function PageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="font-heading text-2xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="flex shrink-0 flex-wrap gap-2">{action}</div> : null}
    </div>
  )
}

export function Panel({ title, description, action, children, className }: { title?: string; description?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card", className)}>
      {title ? (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-semibold">{title}</h2>
            {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
          </div>
          {action ? <div className="flex shrink-0 gap-2">{action}</div> : null}
        </header>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  )
}

export function StatTile({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: string; tone?: "default" | "positive" | "warning" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p
        className={cn(
          "mt-2 font-heading text-2xl",
          tone === "positive" && "text-emerald-600",
          tone === "warning" && "text-amber-600",
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function LoadingBlock({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={label}>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-16 rounded-xl" />
      ))}
    </div>
  )
}

export function ErrorBlock({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const notFound = error instanceof ApiError && error.status === 404
  const forbidden = error instanceof ApiError && error.status === 403
  const message = notFound
    ? "We couldn't find that record. It may have been removed."
    : forbidden
      ? "Your role doesn't have access to this area."
      : error instanceof Error
        ? error.message
        : "Something went wrong."

  return (
    <div role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <AlertCircle className="mx-auto size-6 text-destructive" aria-hidden="true" />
      <p className="mt-3 font-semibold">{message}</p>
      {onRetry && !notFound && !forbidden ? (
        <Button variant="outline" size="lg" className="mt-5" onClick={onRetry}>
          <RotateCcw data-icon="inline-start" /> Try again
        </Button>
      ) : null}
    </div>
  )
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <p className="font-semibold">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p> : null}
      {action ? <div className="mt-6 flex justify-center gap-2">{action}</div> : null}
    </div>
  )
}

export function Pill({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "positive" | "warning" | "danger" | "accent" }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700 ring-slate-500/20",
    positive: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
    danger: "bg-rose-50 text-rose-700 ring-rose-600/20",
    accent: "bg-primary/10 text-primary ring-primary/20",
  } as const
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset", tones[tone])}>{children}</span>
}

export function SavingButton({ pending, children, ...props }: { pending: boolean; children: ReactNode } & React.ComponentProps<typeof Button>) {
  return (
    <Button disabled={pending || props.disabled} {...props}>
      {pending ? <Loader2 className="animate-spin" data-icon="inline-start" /> : null}
      {children}
    </Button>
  )
}

/** Horizontal scroll container so wide tables never force the page to scroll sideways. */
export function TableScroll({ children }: { children: ReactNode }) {
  return <div className="-mx-5 overflow-x-auto px-5">{children}</div>
}
