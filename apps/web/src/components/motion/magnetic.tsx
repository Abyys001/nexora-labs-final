"use client"

import { useRef, type PointerEvent, type ReactNode } from "react"

import { hasFinePointer, prefersReducedMotion } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

/** Pulls its child a few pixels toward the cursor. Inert on touch and under reduced motion. */
export function Magnetic({ children, strength = 0.25, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)

  function onMove(event: PointerEvent<HTMLSpanElement>) {
    const node = ref.current
    if (!node || !hasFinePointer() || prefersReducedMotion()) return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - (rect.left + rect.width / 2)) * strength
    const y = (event.clientY - (rect.top + rect.height / 2)) * strength
    node.style.transform = `translate3d(${x}px, ${y}px, 0)`
  }

  function reset() {
    if (ref.current) ref.current.style.transform = ""
  }

  return (
    <span
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className={cn("inline-flex transition-transform duration-300 ease-out will-change-transform", className)}
    >
      {children}
    </span>
  )
}
