"use client"

import type { ElementType, ReactNode } from "react"

import { useInView } from "@/hooks/use-in-view"
import { cn } from "@/lib/utils"

/** Pauses continuous CSS animations inside it while it is off-screen, so idle sections cost no CPU. */
export function LiveRegion({
  as: Tag = "div",
  className,
  children,
  ...rest
}: { as?: ElementType; className?: string; children: ReactNode } & Record<string, unknown>) {
  const [ref, inView] = useInView<HTMLElement>({ rootMargin: "120px 0px", once: false })
  return (
    <Tag ref={ref} data-live={inView ? "on" : "off"} className={cn(className)} {...rest}>
      {children}
    </Tag>
  )
}
