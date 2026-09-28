import { EnquiryDetail } from "@/components/admin/enquiry-detail"

export const metadata = { title: "Request" }

export default async function AdminRequestPage({ params }: PageProps<"/admin/requests/[id]">) {
  const { id } = await params
  return <EnquiryDetail id={id} />
}
