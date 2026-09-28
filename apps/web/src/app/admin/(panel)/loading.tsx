import { Skeleton } from "@/components/ui/skeleton"

export default function AdminLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-80 rounded-2xl" />
    </div>
  )
}
