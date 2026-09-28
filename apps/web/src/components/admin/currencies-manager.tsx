"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertTriangle, RefreshCw, Save } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

import { useCan } from "./admin-context"
import { currencyKeys, fetchCurrencies, fetchCurrencyHistory, refreshCurrencies, updateCurrency, type CurrencyRow } from "./api"
import { EmptyState, ErrorBlock, LoadingBlock, PageHeader, Panel, Pill, SavingButton, shortDate, TableScroll } from "./ui"

const roundingOptions = [
  { value: "none", label: "Exact (2 decimals)" },
  { value: "1", label: "Nearest 1" },
  { value: "10", label: "Nearest 10" },
  { value: "50", label: "Nearest 50" },
  { value: "100", label: "Nearest 100" },
] as const

const currencyNames: Record<string, string> = { GBP: "Pound sterling", EUR: "Euro", USD: "US dollar" }

/**
 * Exchange rates, rounding and availability. GBP is the base currency and is
 * never converted; the rate recorded on a request or proposal is snapshotted at
 * the time, so changing a rate here never alters an existing quote.
 */
export function CurrenciesManager() {
  const canEdit = useCan("manager")
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: currencyKeys.list, queryFn: fetchCurrencies })
  const history = useQuery({ queryKey: currencyKeys.history(), queryFn: () => fetchCurrencyHistory() })

  const refresh = useMutation({
    mutationFn: refreshCurrencies,
    onSuccess: () => {
      toast.success("Rates refreshed from the provider")
      void queryClient.invalidateQueries({ queryKey: currencyKeys.all })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Currencies" description="Exchange rates, rounding and which currencies customers can choose." />
        <LoadingBlock label="Loading currencies" rows={3} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Currencies" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }

  const errored = query.data.filter((row) => row.lastRefreshError)

  return (
    <>
      <PageHeader
        title="Currencies"
        description="GBP is the base currency — every price is stored in pounds and converted for display. The rate used on a request or proposal is snapshotted at the time, so a later rate change never alters an existing quote."
        action={
          canEdit ? (
            <SavingButton pending={refresh.isPending} size="lg" onClick={() => refresh.mutate()}>
              <RefreshCw data-icon="inline-start" /> Refresh rates
            </SavingButton>
          ) : null
        }
      />

      {errored.length ? (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-500/30 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold">The last rate refresh failed</p>
            <ul className="mt-1 grid gap-0.5">
              {errored.map((row) => (
                <li key={row.code}>
                  {row.code}: {row.lastRefreshError}
                </li>
              ))}
            </ul>
            <p className="mt-1.5">The last good rate is still in use. You can override it manually below.</p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {query.data.map((row) => (
          <CurrencyCard key={row.code} row={row} canEdit={canEdit} />
        ))}
      </div>

      <Panel title="Rate history" description="Every recorded rate change, provider and manual." className="mt-8">
        {history.isPending ? (
          <LoadingBlock label="Loading history" rows={2} />
        ) : history.isError ? (
          <ErrorBlock error={history.error} onRetry={() => history.refetch()} />
        ) : history.data.length === 0 ? (
          <EmptyState title="No rate history yet" description="History is written the first time a rate is refreshed or overridden." />
        ) : (
          <TableScroll>
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-medium">Currency</th>
                  <th className="py-2 pr-4 font-medium">Rate</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 font-medium">Recorded</th>
                </tr>
              </thead>
              <tbody>
                {history.data.slice(0, 40).map((entry) => (
                  <tr key={entry.id} className="border-b border-border/60 last:border-0">
                    <td className="py-2.5 pr-4 font-mono">{entry.code}</td>
                    <td className="py-2.5 pr-4 font-mono">{entry.rate.toFixed(4)}</td>
                    <td className="py-2.5 pr-4">
                      <Pill tone={entry.source === "manual" ? "warning" : "neutral"}>{entry.source}</Pill>
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">{shortDate(entry.recordedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </Panel>
    </>
  )
}

function CurrencyCard({ row, canEdit }: { row: CurrencyRow; canEdit: boolean }) {
  const queryClient = useQueryClient()
  const isBase = row.code === "GBP"
  const [rate, setRate] = useState(String(row.rate))
  const [rounding, setRounding] = useState(String(row.rounding))
  const [enabled, setEnabled] = useState(row.enabled)

  const save = useMutation({
    mutationFn: (patch: Parameters<typeof updateCurrency>[1]) => updateCurrency(row.code, patch),
    onSuccess: () => {
      toast.success(`${row.code} updated`)
      void queryClient.invalidateQueries({ queryKey: currencyKeys.all })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const parsed = Number(rate)
  const valid = parsed > 0
  const dirty = rate !== String(row.rate) || rounding !== String(row.rounding) || enabled !== row.enabled

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-lg">{row.code}</h2>
          <p className="text-xs text-muted-foreground">{currencyNames[row.code] ?? row.code}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Pill tone={isBase ? "accent" : row.source === "manual" ? "warning" : "neutral"}>{isBase ? "Base" : row.source}</Pill>
          {!isBase ? (
            <Switch
              checked={enabled}
              disabled={!canEdit}
              onCheckedChange={(next) => {
                setEnabled(next)
                save.mutate({ enabled: next })
              }}
              aria-label={`${row.code} available to customers`}
            />
          ) : null}
        </div>
      </header>

      <dl className="mt-4 grid gap-1.5 font-mono text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Last updated</dt>
          <dd>{shortDate(row.rateUpdatedAt)}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Per £1</dt>
          <dd>{row.rate.toFixed(4)}</dd>
        </div>
      </dl>

      {isBase ? (
        <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
          The base currency. Its rate is fixed at 1.0000 and it is always available.
        </p>
      ) : (
        <form
          className="mt-4 grid gap-3 border-t border-border pt-4"
          onSubmit={(e) => {
            e.preventDefault()
            // A hand-entered rate is a manual override and is never overwritten by a provider refresh.
            save.mutate({ rate: parsed, rounding: (rounding === "none" ? "none" : Number(rounding)) as "none" | 1 | 10 | 50 | 100, source: "manual" })
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor={`rate-${row.code}`}>Manual rate</Label>
            <Input
              id={`rate-${row.code}`}
              type="number"
              step={0.0001}
              min={0.0001}
              value={rate}
              disabled={!canEdit}
              aria-invalid={!valid}
              onChange={(e) => setRate(e.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={`rounding-${row.code}`}>Rounding</Label>
            <select
              id={`rounding-${row.code}`}
              value={rounding}
              disabled={!canEdit}
              onChange={(e) => setRounding(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              {roundingOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <SavingButton pending={save.isPending} type="submit" size="lg" variant="outline" disabled={!canEdit || !dirty || !valid}>
            <Save data-icon="inline-start" /> Save override
          </SavingButton>
          <p className="text-xs text-muted-foreground">Saving a rate here marks it manual, so provider refreshes leave it alone.</p>
        </form>
      )}
    </section>
  )
}
