"use client"

import type { CSSProperties, ElementType, ReactNode } from "react"

import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

/**
 * Fades/slides children in once visible. Content is visible without JS and under
 * reduced motion: the hidden state only applies while `data-reveal="pending"`.
 */
export function Reveal({
  as: Tag = "div",
  children,
  className,
  delay = 0,
  variant = "up",
  style,
}: {
  as?: ElementType
  children: ReactNode
  className?: string
  delay?: number
  variant?: "up" | "left" | "right" | "scale" | "fade"
  style?: CSSProperties
}) {
  const [ref, inView] = useInView<HTMLElement>()
  return (
    <Tag
      ref={ref}
      data-reveal={inView ? "done" : "pending"}
      data-variant={variant}
      className={cn("reveal-io", className)}
      style={{ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
