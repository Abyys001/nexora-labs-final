"use client"

import { useEffect, useState } from "react"

import { prefersReducedMotion, useInView } from "@/hooks/use-in-view"

/** Counts from 0 to `value` once visible. Server render shows the final value for SEO and no-JS. */
export function AnimatedCounter({
  value,
  duration = 1400,
  prefix = "",
  suffix = "",
  className,
}: {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    if (!inView || prefersReducedMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setDisplay(Math.round(value * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, value, duration])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      {display.toLocaleString("en-GB")}
      {suffix}
    </span>
  )
}
