import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { BrandIcon, type BrandIconName } from "@/components/icons/brand-icons"
import { cn } from "@/lib/utils"

/** Hover/selection behaviours rotate across a grid so neighbouring cards never move the same way. */
export const cardVariants = ["lift", "sweep", "tilt", "glow"] as const
export type CardVariant = (typeof cardVariants)[number]
export const variantFor = (i: number): CardVariant => cardVariants[i % cardVariants.length]

export function CheckMark({ selected, className }: { selected: boolean; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pb-check flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-200",
        selected ? "border-lime bg-lime text-ink" : "border-white/20 text-transparent",
        className,
      )}
    >
      <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.5 8.5 L6.5 11.5 L12.5 4.5" pathLength={1} />
      </svg>
    </span>
  )
}

export function CardIcon({ brandIcon, icon: Icon, selected, size = "md" }: { brandIcon?: BrandIconName; icon?: LucideIcon; selected: boolean; size?: "md" | "lg" }) {
  return (
    <span
      data-active={selected ? "" : undefined}
      className={cn(
        "pb-icon flex shrink-0 items-center justify-center rounded-xl border transition-colors duration-300",
        size === "lg" ? "size-14" : "size-11",
        selected ? "border-lime/40 bg-lime/10 text-lime" : "border-white/10 bg-white/[0.03] text-white/80 group-hover:text-white",
      )}
      style={{ "--icon-accent": "var(--phosphor)" } as React.CSSProperties}
    >
      {brandIcon ? (
        <BrandIcon name={brandIcon} className={size === "lg" ? "size-9" : "size-7"} />
      ) : Icon ? (
        <Icon className={size === "lg" ? "size-7" : "size-5"} strokeWidth={1.75} aria-hidden="true" />
      ) : null}
    </span>
  )
}

/** A toggle card. Renders a real button with `aria-pressed`, so it works with keyboard and screen readers. */
export function OptionCard({
  selected,
  onToggle,
  variant,
  title,
  description,
  brandIcon,
  icon,
  layout = "stack",
  children,
  className,
}: {
  selected: boolean
  onToggle: () => void
  variant: CardVariant
  title: string
  description?: string
  brandIcon?: BrandIconName
  icon?: LucideIcon
  layout?: "stack" | "row"
  children?: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onToggle}
      data-variant={variant}
      data-selected={selected}
      className={cn(
        "pb-card group relative flex w-full rounded-2xl border p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-lime focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        selected ? "border-lime/70 bg-lime/[0.07]" : "border-white/10 bg-ink-800 hover:border-white/25",
        layout === "stack" ? "flex-col gap-4 sm:p-5" : "items-center gap-3.5",
        className,
      )}
    >
      <span className={cn("flex items-start justify-between gap-3", layout === "row" && "contents")}>
        <CardIcon brandIcon={brandIcon} icon={icon} selected={selected} size={layout === "stack" ? "lg" : "md"} />
        {layout === "stack" ? <CheckMark selected={selected} /> : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-white">{title}</span>
        {description ? <span className="mt-1 block text-sm leading-snug text-white/55 transition-colors group-hover:text-white/75">{description}</span> : null}
        {children}
      </span>
      {layout === "row" ? <CheckMark selected={selected} /> : null}
    </button>
  )
}
