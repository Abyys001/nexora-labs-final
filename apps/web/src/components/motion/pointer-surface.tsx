"use client"

import { useRef, type ElementType, type PointerEvent, type ReactNode } from "react"

import { hasFinePointer, prefersReducedMotion } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

/**
 * Publishes pointer position as CSS variables so children can react in pure CSS:
 * `--mx`/`--my` (px, for spotlight/glow gradients) and `--px`/`--py` (-1..1, for
 * image shift / parallax). Writes go straight to style — no React re-render per move.
 */
export function PointerSurface({
  as: Tag = "div",
  className,
  children,
  ...rest
}: {
  as?: ElementType
  className?: string
  children: ReactNode
} & Record<string, unknown>) {
  const ref = useRef<HTMLElement>(null)
  const frame = useRef(0)

  function onMove(event: PointerEvent<HTMLElement>) {
    const node = ref.current
    if (!node || event.pointerType !== "mouse") return
    const { clientX, clientY } = event
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(() => {
      const rect = node.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top
      node.style.setProperty("--mx", `${x}px`)
      node.style.setProperty("--my", `${y}px`)
      node.style.setProperty("--px", ((x / rect.width) * 2 - 1).toFixed(3))
      node.style.setProperty("--py", ((y / rect.height) * 2 - 1).toFixed(3))
    })
  }

  function onLeave() {
    const node = ref.current
    if (!node) return
    cancelAnimationFrame(frame.current)
    node.style.setProperty("--px", "0")
    node.style.setProperty("--py", "0")
  }

  return (
    <Tag
      ref={ref}
      className={cn("pointer-surface", className)}
      onPointerMove={(e: PointerEvent<HTMLElement>) => hasFinePointer() && !prefersReducedMotion() && onMove(e)}
      onPointerLeave={onLeave}
      {...rest}
    >
      {children}
    </Tag>
  )
}
