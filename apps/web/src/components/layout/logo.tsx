import Link from "next/link"

import { cn } from "@/lib/utils"

// "N" drawn on a 7×7 pixel grid, echoing the brand's pixel-art marks.
const N_PIXELS = [
  [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6],
  [1, 1], [2, 2], [3, 3], [4, 4], [5, 5],
  [6, 0], [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [6, 6],
] as const

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-8", className)}>
      <rect width="32" height="32" rx="8" fill="#BFF747" />
      {N_PIXELS.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={6.5 + x * 2.75} y={6.5 + y * 2.75} width="2.5" height="2.5" rx="0.4" fill="#000" />
      ))}
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)} aria-label="Nexora Labs home">
      <LogoMark className="transition-transform duration-500 ease-out group-hover:rotate-[-8deg]" />
      <span className="flex items-baseline gap-1 text-[1.05rem] font-semibold tracking-tight text-foreground">
        Nexora
        <span className="font-mono text-[0.85rem] font-normal text-muted-foreground">
          labs<span className="logo-cursor text-lime">_</span>
        </span>
      </span>
    </Link>
  )
}
