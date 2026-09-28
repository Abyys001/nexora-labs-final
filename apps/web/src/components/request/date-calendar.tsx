"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMemo, useState } from "react"

import { cn } from "@/lib/utils"

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"]

function toUtc(iso: string): Date {
  return new Date(`${iso}T00:00:00.000Z`)
}

function isoOf(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

/** Monday-first offset for the first cell of the grid. */
function leadingBlanks(first: Date): number {
  return (first.getUTCDay() + 6) % 7
}

const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" })
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })

/**
 * Month calendar constrained to [min, max]. Dates outside the window are
 * rendered disabled rather than hidden, so the customer can see why a date
 * isn't available instead of wondering where it went.
 */
export function DateCalendar({
  value,
  onChange,
  min,
  max,
  label,
}: {
  value: string | null
  onChange: (iso: string) => void
  min: string
  max: string
  label: string
}) {
  const minDate = toUtc(min)
  const maxDate = toUtc(max)
  const [cursor, setCursor] = useState(() => startOfMonth(value ? toUtc(value) : minDate))

  const cells = useMemo(() => {
    const first = startOfMonth(cursor)
    const daysInMonth = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).getUTCDate()
    const blanks = leadingBlanks(first)
    return [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), i + 1))),
    ]
  }, [cursor])

  const canGoBack = startOfMonth(cursor).getTime() > startOfMonth(minDate).getTime()
  const canGoForward = startOfMonth(cursor).getTime() < startOfMonth(maxDate).getTime()

  function shiftMonth(delta: number) {
    setCursor((c) => new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + delta, 1)))
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoBack}
          aria-label="Previous month"
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
        </button>
        <p aria-live="polite" className="font-mono text-sm font-medium text-white">
          {monthLabel.format(cursor)}
        </p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          disabled={!canGoForward}
          aria-label="Next month"
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div role="grid" aria-label={label} className="mt-4">
        <div role="row" className="grid grid-cols-7 gap-1 pb-2">
          {WEEKDAYS.map((day) => (
            <abbr key={day} role="columnheader" title={day} className="text-center font-mono text-[0.65rem] tracking-wide text-white/35 no-underline uppercase">
              {day}
            </abbr>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((date, i) => {
            if (!date) return <span key={`blank-${i}`} aria-hidden="true" />
            const iso = isoOf(date)
            const disabled = date.getTime() < minDate.getTime() || date.getTime() > maxDate.getTime()
            const selected = iso === value
            return (
              <button
                key={iso}
                type="button"
                role="gridcell"
                aria-selected={selected}
                aria-label={dayLabel.format(date)}
                disabled={disabled}
                onClick={() => onChange(iso)}
                className={cn(
                  "flex h-9 items-center justify-center rounded-lg font-mono text-sm transition-colors outline-none focus-visible:ring-2 focus-visible:ring-lime",
                  selected
                    ? "bg-lime font-semibold text-ink"
                    : disabled
                      ? "cursor-not-allowed text-white/15"
                      : "text-white/75 hover:bg-white/10 hover:text-white",
                )}
              >
                {date.getUTCDate()}
              </button>
            )
          })}
        </div>
      </div>

      <p className="mt-3 border-t border-white/10 pt-3 font-mono text-[0.7rem] text-white/40">
        Available window: {dayLabel.format(minDate)} — {dayLabel.format(maxDate)}
      </p>
    </div>
  )
}
