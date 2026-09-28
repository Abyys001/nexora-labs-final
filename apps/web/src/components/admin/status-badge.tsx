import type { EnquiryStatus } from "@/lib/enquiry"
import { cn } from "@/lib/utils"

export const statusStyles: Record<EnquiryStatus, string> = {
  new: "bg-primary/10 text-primary ring-primary/20",
  contacted: "bg-sky-50 text-sky-700 ring-sky-600/20",
  qualified: "bg-amber-50 text-amber-700 ring-amber-600/20",
  won: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  lost: "bg-rose-50 text-rose-700 ring-rose-600/20",
  archived: "bg-slate-100 text-slate-600 ring-slate-500/20",
}

export function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1 ring-inset", statusStyles[status])}>
      {status}
    </span>
  )
}
