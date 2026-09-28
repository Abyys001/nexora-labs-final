import { ProposalEditor } from "@/components/admin/proposal-editor"

export const metadata = { title: "Proposal" }

export default async function AdminProposalPage({ params }: PageProps<"/admin/proposals/[id]">) {
  const { id } = await params
  return <ProposalEditor id={id} />
}
