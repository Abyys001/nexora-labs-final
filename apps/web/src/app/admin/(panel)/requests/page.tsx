import { Suspense } from "react"

import { EnquiriesInbox } from "@/components/admin/enquiries-inbox"

export const metadata = { title: "Requests" }

export default function AdminRequestsPage() {
  return (
    <Suspense>
      <EnquiriesInbox />
    </Suspense>
  )
}
