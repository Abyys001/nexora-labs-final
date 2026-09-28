"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, FileDown, Send, Undo2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useCan } from "./admin-context"
import {
  fetchProposal,
  proposalKeys,
  proposalPdfUrl,
  publishProposal,
  updateProposal,
  withdrawProposal,
  type Proposal,
  type ProposalContent,
} from "./api"
import { proposalTone } from "./proposals-list"
import { ErrorBlock, gbp, LoadingBlock, money, PageHeader, Panel, Pill, SavingButton, shortDate } from "./ui"

const listFields: { key: keyof Pick<ProposalContent, "requirements" | "assumptions" | "exclusions" | "nextSteps">; label: string; hint: string }[] = [
  { key: "requirements", label: "Requirements", hint: "What the client asked for, one per line." },
  { key: "assumptions", label: "Assumptions", hint: "What the price depends on, one per line." },
  { key: "exclusions", label: "Not included", hint: "What is explicitly out of scope, one per line." },
  { key: "nextSteps", label: "Next steps", hint: "What happens after acceptance, one per line." },
]

const toLines = (values: string[]) => values.join("\n")
const fromLines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)

export function ProposalEditor({ id }: { id: string }) {
  const query = useQuery({ queryKey: proposalKeys.detail(id), queryFn: () => fetchProposal(id) })

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Proposal" />
        <LoadingBlock label="Loading proposal" rows={4} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Proposal" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }
  // Keyed on updatedAt so the editor resets to server state after each save.
  return <EditorView key={query.data.updatedAt} proposal={query.data} />
}

function EditorView({ proposal }: { proposal: Proposal }) {
  const canEdit = useCan("manager")
  const queryClient = useQueryClient()
  const editable = proposal.status === "draft"

  const [summary, setSummary] = useState(proposal.content.summary)
  const [lists, setLists] = useState({
    requirements: toLines(proposal.content.requirements),
    assumptions: toLines(proposal.content.assumptions),
    exclusions: toLines(proposal.content.exclusions),
    nextSteps: toLines(proposal.content.nextSteps),
  })
  const [scope, setScope] = useState(proposal.content.scope.map((entry) => `${entry.title}\n${entry.body}`).join("\n\n"))
  const [validUntil, setValidUntil] = useState(proposal.validUntil ?? "")

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: proposalKeys.all })
    void queryClient.invalidateQueries({ queryKey: ["enquiries"] })
  }

  const save = useMutation({
    mutationFn: () =>
      updateProposal(proposal.id, {
        content: {
          summary: summary.trim(),
          requirements: fromLines(lists.requirements),
          assumptions: fromLines(lists.assumptions),
          exclusions: fromLines(lists.exclusions),
          nextSteps: fromLines(lists.nextSteps),
          scope: parseScope(scope),
        },
        ...(validUntil ? { validUntil } : {}),
      }),
    onSuccess: () => {
      toast.success("Proposal saved")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const publish = useMutation({
    mutationFn: () => publishProposal(proposal.id),
    onSuccess: () => {
      toast.success("Proposal published — the customer can see it now")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const withdraw = useMutation({
    mutationFn: () => withdrawProposal(proposal.id),
    onSuccess: () => {
      toast.success("Proposal withdrawn")
      invalidate()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const delta = proposal.finalPriceGbp - proposal.automatedEstimateGbp

  return (
    <>
      <Link href="/admin/proposals" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> All proposals
      </Link>

      <PageHeader
        title={`Proposal v${proposal.version}`}
        description={
          editable
            ? "A draft is private to the team. Publishing makes it visible on the customer's request page."
            : "Published and accepted proposals are read-only — create a new version from the request to change the terms."
        }
        action={
          <>
            <Button asChild variant="outline" size="lg">
              <a href={proposalPdfUrl(proposal.id)} target="_blank" rel="noopener">
                <FileDown data-icon="inline-start" /> PDF
              </a>
            </Button>
            {canEdit && editable ? (
              <SavingButton pending={publish.isPending} size="lg" onClick={() => publish.mutate()}>
                <Send data-icon="inline-start" /> Publish
              </SavingButton>
            ) : null}
            {canEdit && proposal.status === "published" ? (
              <SavingButton pending={withdraw.isPending} size="lg" variant="destructive" onClick={() => withdraw.mutate()}>
                <Undo2 data-icon="inline-start" /> Withdraw
              </SavingButton>
            ) : null}
          </>
        }
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Status</p>
          <p className="mt-2">
            <Pill tone={proposalTone[proposal.status]}>{proposal.status}</Pill>
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Automated estimate</p>
          <p className="mt-2 font-heading text-xl text-muted-foreground">{gbp(proposal.automatedEstimateGbp)}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Final commercial price</p>
          <p className="mt-2 font-heading text-xl">{gbp(proposal.finalPriceGbp)}</p>
          {delta !== 0 ? (
            <p className={delta > 0 ? "mt-1 text-xs text-emerald-600" : "mt-1 text-xs text-amber-600"}>
              {delta > 0 ? "+" : "−"}
              {gbp(Math.abs(delta))} vs estimate
            </p>
          ) : (
            <p className="mt-1 text-xs text-muted-foreground">Matches the automated estimate</p>
          )}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Customer currency</p>
          <p className="mt-2 font-heading text-xl">{money(proposal.amountInCurrency ?? proposal.finalPriceGbp, proposal.currency)}</p>
          <p className="mt-1 font-mono text-xs text-muted-foreground">
            {proposal.exchangeRate ? `@ ${proposal.exchangeRate.toFixed(4)} · ${shortDate(proposal.rateRecordedAt)}` : "Base currency"}
          </p>
        </div>
      </div>

      <form
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          save.mutate()
        }}
      >
        <Panel title="Project summary" description="The opening paragraph of the proposal and the PDF.">
          <Textarea value={summary} disabled={!canEdit || !editable} onChange={(e) => setSummary(e.target.value)} className="min-h-32" maxLength={4000} />
        </Panel>

        <Panel title="Scope of work" description="One block per phase: the first line is the title, the rest is the body. Separate blocks with a blank line.">
          <Textarea
            value={scope}
            disabled={!canEdit || !editable}
            onChange={(e) => setScope(e.target.value)}
            className="min-h-48 font-mono text-sm"
            placeholder={"Phase 1 — Discovery\nWorkshops, a clickable prototype and a signed-off backlog.\n\nPhase 2 — Build\nIterative delivery in two-week increments."}
          />
        </Panel>

        <div className="grid gap-6 lg:grid-cols-2">
          {listFields.map((field) => (
            <Panel key={field.key} title={field.label} description={field.hint}>
              <Textarea
                value={lists[field.key]}
                disabled={!canEdit || !editable}
                onChange={(e) => setLists({ ...lists, [field.key]: e.target.value })}
                className="min-h-36"
              />
            </Panel>
          ))}
        </div>

        <Panel title="Validity">
          <div className="grid max-w-xs gap-1.5">
            <Label htmlFor="valid-until">Valid until</Label>
            <Input id="valid-until" type="date" value={validUntil} disabled={!canEdit || !editable} onChange={(e) => setValidUntil(e.target.value)} />
          </div>
        </Panel>

        {canEdit && editable ? (
          <div>
            <SavingButton pending={save.isPending} type="submit" size="xl" disabled={!summary.trim()}>
              Save draft
            </SavingButton>
          </div>
        ) : null}
      </form>
    </>
  )
}

/** Blank-line separated blocks; the first line of each is its title. */
function parseScope(value: string): { title: string; body: string }[] {
  return value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [title, ...rest] = block.split("\n")
      return { title: title.trim(), body: rest.join("\n").trim() || title.trim() }
    })
    .filter((entry) => entry.title.length > 0)
}
