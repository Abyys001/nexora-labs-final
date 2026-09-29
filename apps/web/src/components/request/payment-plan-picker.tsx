"use client"

import type { PaymentPlanKind } from "@cybercina/pricing"
import { secondInstalmentWindow } from "@cybercina/pricing"
import { CalendarDays, Check, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"

import { choosePaymentPlan } from "@/app/actions/project-request"
import { FormError } from "@/components/forms/form-status"
import { Button } from "@/components/ui/button"
import { formatMoney } from "@/lib/catalog"
import { formatDate, paymentPlanOptions } from "@/lib/request-view"
import { cn } from "@/lib/utils"

import { DateCalendar } from "./date-calendar"

export function PaymentPlanPicker({
  token,
  totalGbp,
  currency,
  exchangeRate,
  timelineWeeks,
}: {
  token: string
  totalGbp: number
  currency: string
  exchangeRate: number
  timelineWeeks: number
}) {
  const router = useRouter()
  const [plan, setPlan] = useState<PaymentPlanKind | null>(null)
  const [secondDate, setSecondDate] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  // The API stamps the acceptance date at submission, so the window is computed
  // from today — matching what the server will validate against.
  const today = useMemo(() => new Date(), [])
  const chosen = paymentPlanOptions.find((option) => option.id === plan)
  const window = useMemo(() => {
    if (!plan || plan === "full") return null
    try {
      return secondInstalmentWindow(plan, today, timelineWeeks)
    } catch {
      return null
    }
  }, [plan, today, timelineWeeks])

  const inCurrency = (gbp: number) => formatMoney(currency === "GBP" ? gbp : Math.round(gbp * exchangeRate * 100) / 100, currency)
  const second = Math.floor(totalGbp / 2)
  const first = totalGbp - second

  function confirm() {
    if (!plan) {
      setError("Choose a payment plan to continue.")
      return
    }
    if (chosen?.needsDate && !secondDate) {
      setError("Choose a date for the second payment.")
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await choosePaymentPlan(token, plan, secondDate ?? undefined)
      if (result.status === "success") {
        router.refresh()
        return
      }
      if (result.status === "error") setError(result.message)
    })
  }

  return (
    <div className="grid gap-6">
      <fieldset>
        <legend className="sr-only">Payment plan</legend>
        <ul className="grid gap-3 lg:grid-cols-3">
          {paymentPlanOptions.map((option) => {
            const selected = option.id === plan
            return (
              <li key={option.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => {
                    setPlan(option.id)
                    setSecondDate(null)
                    setError(null)
                  }}
                  className={cn(
                    "flex h-full w-full flex-col gap-2 rounded-2xl border p-5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-lime",
                    selected ? "border-lime/70 bg-lime/[0.07]" : "border-white/10 bg-ink-800 hover:border-white/25",
                  )}
                >
                  <span className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-white">{option.label}</span>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full border",
                        selected ? "border-lime bg-lime text-ink" : "border-white/20 text-transparent",
                      )}
                    >
                      <Check className="size-3" />
                    </span>
                  </span>
                  <span className="text-sm leading-snug text-white/55">{option.summary}</span>
                  <span className="mt-auto pt-2 font-mono text-xs text-lime">
                    {option.id === "full" ? inCurrency(totalGbp) : `${inCurrency(first)} + ${inCurrency(second)}`}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </fieldset>

      {chosen ? <p className="text-sm leading-relaxed text-white/60">{chosen.detail}</p> : null}

      {chosen?.needsDate && window ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
          <DateCalendar value={secondDate} onChange={setSecondDate} min={window.min} max={window.max} label="Choose the second payment date" />
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="flex items-center gap-2 font-mono text-[0.7rem] tracking-[0.14em] text-lime uppercase">
              <CalendarDays className="size-3.5" aria-hidden="true" /> Second payment
            </p>
            <p className="mt-2 font-heading text-xl text-white">{secondDate ? formatDate(secondDate) : "Choose a date"}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">
              {plan === "split-completion"
                ? "This is the completion milestone payment. It can fall from two weeks before the planned completion date up to 30 days after it."
                : "This payment falls during the build. It must be at least two weeks after the project starts and at least a week before delivery completes."}
            </p>
          </div>
        </div>
      ) : null}

      {error ? <FormError message={error} /> : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" size="xl" onClick={confirm} disabled={pending || !plan} className="bg-lime text-ink hover:bg-lime/90">
          {pending ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" aria-hidden="true" /> : null}
          {pending ? "Confirming…" : "Confirm payment plan"}
        </Button>
        <p className="text-xs text-white/40">Confirming accepts the proposal and locks the schedule. We&apos;ll invoice against it — nothing is charged here.</p>
      </div>
    </div>
  )
}
