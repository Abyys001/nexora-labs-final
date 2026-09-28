"use client"

import { useQuery } from "@tanstack/react-query"
import { FileDown } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"

import { fetchProposals, proposalKeys, proposalPdfUrl, type ProposalStatus } from "./api"
import { EmptyState, ErrorBlock, gbp, LoadingBlock, PageHeader, Panel, Pill, shortDate, TableScroll } from "./ui"

export const proposalTone: Record<ProposalStatus, "neutral" | "positive" | "warning" | "danger" | "accent"> = {
  draft: "neutral",
  published: "accent",
  accepted: "positive",
  superseded: "neutral",
  withdrawn: "danger",
}

export function ProposalsList() {
  const query = useQuery({ queryKey: proposalKeys.list, queryFn: fetchProposals })

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Proposals" description="Every commercial proposal, from first draft to acceptance." />
        <LoadingBlock label="Loading proposals" rows={4} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Proposals" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="Proposals"
        description="Drafts are private. Publishing makes a proposal visible on the customer's private request page, where they can download the PDF and choose a payment plan."
      />
      <Panel>
        {query.data.length === 0 ? (
          <EmptyState
            title="No proposals yet"
            description="Open a request, set its final commercial price, then draft a proposal from there."
            action={
              <Button asChild size="lg">
                <Link href="/admin/requests">Go to requests</Link>
              </Button>
            }
          />
        ) : (
          <TableScroll>
            <table className="w-full min-w-[46rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-medium">Version</th>
                  <th className="py-2 pr-4 font-medium">Estimate</th>
                  <th className="py-2 pr-4 font-medium">Final price</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Published</th>
                  <th className="py-2 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {query.data.map((proposal) => {
                  const delta = proposal.finalPriceGbp - proposal.automatedEstimateGbp
                  return (
                    <tr key={proposal.id} className="group border-b border-border/60 last:border-0">
                      <td className="relative py-3 pr-4">
                        <Link href={`/admin/proposals/${proposal.id}`} className="font-semibold after:absolute after:inset-0 group-hover:text-primary">
                          v{proposal.version}
                        </Link>
                        <span className="block font-mono text-[0.7rem] text-muted-foreground">{proposal.enquiryId.slice(0, 8)}</span>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{gbp(proposal.automatedEstimateGbp)}</td>
                      <td className="py-3 pr-4 font-mono text-xs">
                        {gbp(proposal.finalPriceGbp)}
                        {delta !== 0 ? (
                          <span className={delta > 0 ? "ml-1.5 text-emerald-600" : "ml-1.5 text-amber-600"}>
                            {delta > 0 ? "+" : "−"}
                            {gbp(Math.abs(delta))}
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 pr-4">
                        <Pill tone={proposalTone[proposal.status]}>{proposal.status}</Pill>
                      </td>
                      <td className="py-3 pr-4 text-xs text-muted-foreground">{shortDate(proposal.publishedAt)}</td>
                      <td className="relative z-10 py-3">
                        <Button asChild size="sm" variant="outline">
                          <a href={proposalPdfUrl(proposal.id)} target="_blank" rel="noopener">
                            <FileDown data-icon="inline-start" /> PDF
                          </a>
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </TableScroll>
        )}
      </Panel>
    </>
  )
}
