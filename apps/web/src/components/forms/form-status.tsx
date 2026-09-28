import { AlertCircle, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"

export function FormError({ message }: { message: string }) {
  return (
    <div role="alert" className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
      <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <p>{message}</p>
    </div>
  )
}

export function FormSuccess({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div role="status" className="flex flex-col items-center rounded-3xl border border-border bg-card px-6 py-16 text-center sm:px-12">
      <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>
      <h2 className="mt-6 text-2xl font-semibold">{title}</h2>
      <div className="mt-3 max-w-md leading-relaxed text-muted-foreground">{children}</div>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="xl" variant="outline"><Link href="/work">View Example Projects</Link></Button>
        <Button asChild size="xl" variant="ghost"><Link href="/">Back to Home</Link></Button>
      </div>
    </div>
  )
}
