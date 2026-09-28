"use client"

import { useEffect, useRef, useState } from "react"

import { prefersReducedMotion } from "@/hooks/use-in-view"

/** Eases from the previously shown value to `value` whenever it changes. */
export function TweenedNumber({ value, duration = 650, prefix = "", className }: { value: number; duration?: number; prefix?: string; className?: string }) {
  const [display, setDisplay] = useState(value)
  const shown = useRef(value)

  useEffect(() => {
    const from = shown.current
    if (from === value) return
    const span = prefersReducedMotion() ? 0 : duration
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = span ? Math.min(1, (now - start) / span) : 1
      shown.current = Math.round(from + (value - from) * (1 - Math.pow(1 - t, 3)))
      setDisplay(shown.current)
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {display.toLocaleString("en-GB")}
    </span>
  )
}
