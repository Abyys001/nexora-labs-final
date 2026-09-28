"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { ArrowLeft, FileText, Mail, Phone, RotateCcw, Save } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { builderLabel, projectStageLabels, userScaleLabels } from "@/content/project-builder"
import { budgets, companySizes, contactMethods, enquiryStatuses, labelFor, projectTypes, timelines, type EnquiryStatus } from "@/lib/enquiry"
import { formatDateTime } from "@/lib/utils"

import { useCan } from "./admin-context"
import {
  ApiError,
  createProposalDraft,
  enquiryKeys,
  fetchEnquiry,
  setFinalPrice,
  updateEnquiry,
  type EnquiryDetail as EnquiryDetailData,
  type PriceChangeMode,
} from "./api"
import { proposalTone } from "./proposals-list"
import { StatusBadge } from "./status-badge"
import { ErrorBlock, gbp, LoadingBlock, money, Panel, Pill, SavingButton, shortDate, TableScroll } from "./ui"

const selectionGroups: { key: "solutionTypes" | "features" | "platforms" | "integrations" | "ai" | "design"; label: string }[] = [
  { key: "solutionTypes", label: "Solution" },
  { key: "features", label: "Features" },
  { key: "platforms", label: "Platforms" },
  { key: "integrations", label: "Integrations" },
  { key: "ai", label: "AI" },
  { key: "design", label: "Design" },
]

function PillList({ kind, ids }: { kind: "solutionTypes" | "industries" | "goals" | "features" | "platforms" | "integrations" | "ai" | "design"; ids: string[] }) {
  if (!ids.length) return <p className="mt-1 text-sm text-muted-foreground">—</p>
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {ids.map((id) => (
        <span key={id} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {builderLabel(kind, id)}
        </span>
      ))}
    </div>
  )
}

export function EnquiryDetail({ id }: { id: string }) {
  const query = useQuery({ queryKey: enquiryKeys.detail(id), queryFn: () => fetchEnquiry(id) })

  if (query.isPending) return <LoadingBlock label="Loading request" rows={4} />
  if (query.isError) {
    const notFound = query.error instanceof ApiError && query.error.status === 404
    return (
      <div>
        <ErrorBlock error={query.error} onRetry={notFound ? undefined : () => query.refetch()} />
        <div className="mt-4 flex justify-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/admin/requests">
              <ArrowLeft data-icon="inline-start" /> Back to requests
            </Link>
          </Button>
        </div>
      </div>
    )
  }
  // Keyed on updatedAt so the editor's local state resets after a save or refetch.
  return <DetailView key={query.data.updatedAt} enquiry={query.data} />
}

function DetailView({ enquiry }: { enquiry: EnquiryDetailData }) {
  const queryClient = useQueryClient()
  const [notes, setNotes] = useState(enquiry.notes ?? "")

  const mutation = useMutation({
    mutationFn: (patch: { status?: EnquiryStatus; notes?: string }) => updateEnquiry(enquiry.id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(enquiryKeys.detail(enquiry.id), updated)
      void queryClient.invalidateQueries({ queryKey: ["enquiries", "list"] })
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.stats })
      toast.success("Request updated")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const rows: [string, string][] = [
    ["Reference", enquiry.reference ?? "—"],
    ["Source", enquiry.source === "quote" ? "Project Builder" : "Contact form"],
    ["Project type", labelFor(projectTypes, enquiry.projectType)],
    ["Budget", labelFor(budgets, enquiry.budget)],
    ["Timeline", labelFor(timelines, enquiry.timeline)],
    ["Key dates", enquiry.startDate || "—"],
    ["Company", enquiry.company || "—"],
    ["Company size", labelFor(companySizes, enquiry.companySize)],
    ["Industry", enquiry.industry || "—"],
    ["Website", enquiry.website || "—"],
    ["Preferred contact", labelFor(contactMethods, enquiry.preferredContact)],
    ["Currency", enquiry.currency ?? "GBP"],
    ["Received", formatDateTime(enquiry.createdAt)],
  ]

  return (
    <div className="space-y-6">
      <Link href="/admin/requests" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" aria-hidden="true" /> Back to requests
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-heading text-2xl">{enquiry.name}</h1>
            <StatusBadge status={enquiry.status} />
            {enquiry.reference ? <Pill tone="accent">{enquiry.reference}</Pill> : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            <a href={`mailto:${enquiry.email}`} className="inline-flex items-center gap-1.5 hover:text-primary">
              <Mail className="size-4" aria-hidden="true" />
              {enquiry.email}
            </a>
            {enquiry.phone ? (
              <a href={`tel:${enquiry.phone}`} className="inline-flex items-center gap-1.5 hover:text-primary">
                <Phone className="size-4" aria-hidden="true" />
                {enquiry.phone}
              </a>
            ) : null}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          Status
          <select
            value={enquiry.status}
            disabled={mutation.isPending}
            onChange={(e) => mutation.mutate({ status: e.target.value as EnquiryStatus })}
            className="h-10 rounded-lg border border-input bg-card px-3 text-sm capitalize outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/15"
          >
            {enquiryStatuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <CommercialPanel enquiry={enquiry} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-start">
        <div className="space-y-6">
          <Panel title="Project description">
            <p className="leading-relaxed whitespace-pre-wrap">{enquiry.description}</p>
          </Panel>

          {enquiry.selection ? (
            <Panel title="Configuration" description="What the customer selected in the Project Builder.">
              <dl className="grid gap-4 text-sm">
                {selectionGroups.map((group) => (
                  <div key={group.key}>
                    <dt className="text-muted-foreground">{group.label}</dt>
                    <PillList kind={group.key} ids={enquiry.selection![group.key]} />
                  </div>
                ))}
                <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Complexity</dt>
                    <dd className="mt-1 font-medium capitalize">{enquiry.selection.complexity.replace(/-/g, " ")}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Timeline</dt>
                    <dd className="mt-1 font-medium">{enquiry.selection.timeline}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Scale</dt>
                    <dd className="mt-1 font-medium">{enquiry.selection.userScale ?? "Not specified"}</dd>
                  </div>
                </div>
              </dl>
            </Panel>
          ) : null}

          {enquiry.projectDetails ? <ProjectDetailsPanel details={enquiry.projectDetails} /> : null}

          {enquiry.configuration ? (
            <Panel title="Legacy builder configuration" description="Captured before the catalogue-driven builder; kept for reference.">
              <p className="text-lg font-semibold">
                {gbp(enquiry.configuration.estimate.min)} – {gbp(enquiry.configuration.estimate.max)}
              </p>
              <dl className="mt-4 space-y-4 text-sm">
                {enquiry.configuration.userScale ? (
                  <div>
                    <dt className="text-muted-foreground">User scale</dt>
                    <dd className="mt-1 font-medium">{userScaleLabels[enquiry.configuration.userScale]}</dd>
                  </div>
                ) : null}
                {enquiry.configuration.stage ? (
                  <div>
                    <dt className="text-muted-foreground">Stage</dt>
                    <dd className="mt-1 font-medium">{projectStageLabels[enquiry.configuration.stage]}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-muted-foreground">Features</dt>
                  <PillList kind="features" ids={enquiry.configuration.features} />
                </div>
              </dl>
            </Panel>
          ) : null}

          <Panel title="Internal notes" description="Only ever visible to the team.">
            <Label htmlFor="notes" className="sr-only">
              Internal notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={10_000}
              placeholder="Calls, next steps, qualification…"
              className="min-h-40"
            />
            <div className="mt-3 flex justify-end">
              <SavingButton pending={mutation.isPending} size="lg" disabled={notes === (enquiry.notes ?? "")} onClick={() => mutation.mutate({ notes })}>
                <Save data-icon="inline-start" /> Save notes
              </SavingButton>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <section className="h-fit rounded-2xl border border-border bg-card" aria-label="Request details">
            <dl className="divide-y divide-border">
              {rows.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[130px_1fr] gap-3 px-5 py-3 text-sm">
                  <dt className="text-muted-foreground">{label}</dt>
                  <dd className="font-medium break-words">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {enquiry.priceChanges.length ? (
            <Panel title="Price history" description="Every change to the final commercial price.">
              <ol className="grid gap-3 text-sm">
                {enquiry.priceChanges.map((change) => (
                  <li key={change.id} className="border-b border-border/60 pb-3 last:border-0 last:pb-0">
                    <p className="flex items-baseline justify-between gap-2 font-mono text-xs">
                      <span>
                        {change.previousGbp !== null ? `${gbp(change.previousGbp)} → ` : ""}
                        <span className="font-semibold">{gbp(change.newGbp)}</span>
                      </span>
                      <span className="text-muted-foreground">{shortDate(change.createdAt)}</span>
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <span className="capitalize">{change.mode}</span> · {change.reason}
                    </p>
                  </li>
                ))}
              </ol>
            </Panel>
          ) : null}

          {enquiry.paymentPlan ? (
            <Panel title="Payment schedule">
              <ol className="grid gap-3 text-sm">
                {enquiry.paymentPlan.items.map((item) => (
                  <li key={item.id} className="flex items-baseline justify-between gap-2 border-b border-border/60 pb-2 last:border-0 last:pb-0">
                    <span>
                      <span className="font-medium">{item.label}</span>
                      <span className="block text-xs text-muted-foreground">Due {shortDate(item.dueDate)}</span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-xs">{gbp(item.amountGbp)}</span>
                      <Pill tone={item.status === "paid" ? "positive" : item.status === "overdue" ? "danger" : "neutral"}>{item.status}</Pill>
                    </span>
                  </li>
                ))}
              </ol>
            </Panel>
          ) : null}
        </div>
      </div>
    </div>
  )
}

function ProjectDetailsPanel({ details }: { details: Record<string, unknown> }) {
  const entries: [string, string][] = [
    ["Goals", asList(details.goals)],
    ["Industries", asList(details.industries)],
    ["Success criteria", asText(details.successCriteria)],
    ["Design notes", asText(details.designNotes)],
    ["Notes", asText(details.notes)],
    ["Preferred start", asText(details.startDate)],
    ["Payment preference", asText(details.paymentPreference)],
  ].filter(([, value]) => value !== "—") as [string, string][]

  if (entries.length === 0) return null

  return (
    <Panel title="Project details" description="Free-text context the customer gave alongside their selections.">
      <dl className="grid gap-4 text-sm">
        {entries.map(([label, value]) => (
          <div key={label}>
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="mt-1 leading-relaxed whitespace-pre-wrap">{value}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

const asList = (value: unknown) => (Array.isArray(value) && value.length ? value.join(", ") : "—")
const asText = (value: unknown) => (typeof value === "string" && value.trim() ? value : "—")

/**
 * The commercial spine of a request: the automated estimate, the final price an
 * authorised admin sets against it, and the proposals issued from it.
 */
function CommercialPanel({ enquiry }: { enquiry: EnquiryDetailData }) {
  const canEdit = useCan("manager")
  const router = useRouter()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<PriceChangeMode>("accept")
  const [amount, setAmount] = useState("")
  const [delta, setDelta] = useState("")
  const [reason, setReason] = useState("")

  const estimateTotal = enquiry.estimateGbp ?? enquiry.estimate?.total ?? null
  const finalPrice = enquiry.finalPriceGbp
  const currency = enquiry.currency ?? "GBP"
  const rate = enquiry.exchangeRate ?? 1

  const price = useMutation({
    mutationFn: () =>
      setFinalPrice(enquiry.id, {
        mode,
        reason: reason.trim(),
        ...(mode === "manual" ? { amountGbp: Number(amount) } : {}),
        ...(mode === "adjust" ? { deltaGbp: Number(delta) } : {}),
      }),
    onSuccess: () => {
      toast.success("Final commercial price set")
      setReason("")
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const draft = useMutation({
    mutationFn: () =>
      createProposalDraft(enquiry.id, {
        content: {
          summary: enquiry.description,
          requirements: (enquiry.features ?? []).slice(0, 20),
          scope: [{ title: "Delivery", body: "Discovery, design, build, testing and launch, delivered in two-week increments with a working demo at the end of each." }],
          assumptions: ["Content and brand assets are supplied by the client.", "One nominated decision-maker is available for weekly reviews."],
          exclusions: ["Third-party licence and hosting fees.", "Ongoing marketing and content production."],
          nextSteps: ["Review this proposal", "Choose a payment plan", "Kick-off call", "Discovery workshop"],
        },
      }),
    onSuccess: (proposal) => {
      toast.success("Draft proposal created")
      void queryClient.invalidateQueries({ queryKey: enquiryKeys.all })
      router.push(`/admin/proposals/${proposal.id}`)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const reasonReady = reason.trim().length >= 3
  const valueReady = mode === "accept" || (mode === "manual" ? Number(amount) > 0 : Number.isFinite(Number(delta)) && Number(delta) !== 0)

  return (
    <Panel
      title="Commercial"
      description="The automated estimate is generated from the catalogue. The final commercial price is what we contract on — set it here, with a reason, and it is recorded against your account."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Automated estimate</p>
          <p className="mt-2 font-heading text-xl text-muted-foreground">{gbp(estimateTotal)}</p>
          {currency !== "GBP" ? <p className="mt-1 font-mono text-xs text-muted-foreground">{money(estimateTotal ? estimateTotal * rate : null, currency)}</p> : null}
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Adjustment</p>
          <p className="mt-2 font-heading text-xl">
            {finalPrice === null || estimateTotal === null
              ? "—"
              : finalPrice === estimateTotal
                ? "No change"
                : `${finalPrice > estimateTotal ? "+" : "−"}${gbp(Math.abs(finalPrice - estimateTotal))}`}
          </p>
        </div>
        <div className="rounded-xl border border-primary/40 bg-primary/[0.04] p-4">
          <p className="font-mono text-[0.65rem] tracking-[0.12em] text-muted-foreground uppercase">Final commercial price</p>
          <p className="mt-2 font-heading text-xl">{gbp(finalPrice)}</p>
          {finalPrice === null ? <p className="mt-1 text-xs text-muted-foreground">Not set yet</p> : null}
        </div>
      </div>

      {enquiry.estimate ? (
        <TableScroll>
          <table className="mt-6 w-full min-w-[30rem] text-sm">
            <tbody>
              {enquiry.estimate.lines.map((line) => (
                <tr key={line.key} className="border-b border-border/60">
                  <td className="py-2 pr-4">
                    {line.label}
                    {line.detail ? <span className="ml-2 text-xs text-muted-foreground">{line.detail}</span> : null}
                  </td>
                  <td className="py-2 text-right font-mono text-xs">{gbp(line.amount)}</td>
                </tr>
              ))}
              {enquiry.estimate.adjustments.map((adjustment) => (
                <tr key={adjustment.key} className="border-b border-border/60 bg-muted/40">
                  <td className="py-2 pr-4">
                    {adjustment.label}
                    <span className="ml-2 font-mono text-xs text-muted-foreground">×{adjustment.multiplier.toFixed(2)}</span>
                  </td>
                  <td className="py-2 text-right font-mono text-xs">{adjustment.amount === 0 ? "—" : `+ ${gbp(adjustment.amount)}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableScroll>
      ) : null}

      {canEdit ? (
        <form
          className="mt-6 grid gap-4 border-t border-border pt-6"
          onSubmit={(e) => {
            e.preventDefault()
            price.mutate()
          }}
        >
          <fieldset>
            <legend className="text-sm font-semibold">Set the final commercial price</legend>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(["accept", "adjust", "manual"] as PriceChangeMode[]).map((option) => (
                <button
                  key={option}
                  type="button"
                  aria-pressed={mode === option}
                  onClick={() => setMode(option)}
                  className={
                    mode === option
                      ? "rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
                      : "rounded-full border border-border px-3.5 py-1.5 text-xs font-medium text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }
                >
                  {option === "accept" ? "Accept estimate" : option === "adjust" ? "Adjust by amount" : "Enter final price"}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            {mode === "adjust" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="price-delta">Adjustment (GBP)</Label>
                <Input id="price-delta" type="number" step={100} value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="7500 or -2500" />
                <p className="text-xs text-muted-foreground">Positive increases the price; negative reduces it.</p>
              </div>
            ) : null}
            {mode === "manual" ? (
              <div className="grid gap-1.5">
                <Label htmlFor="price-amount">Final price (GBP)</Label>
                <Input id="price-amount" type="number" min={1} step={100} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
            ) : null}
            <div className="grid gap-1.5 sm:col-span-2">
              <Label htmlFor="price-reason">Reason</Label>
              <Input id="price-reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why this price — recorded in the audit log" required />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <SavingButton pending={price.isPending} type="submit" size="lg" disabled={!reasonReady || !valueReady}>
              Set final price
            </SavingButton>
            <SavingButton
              pending={draft.isPending}
              type="button"
              size="lg"
              variant="outline"
              disabled={finalPrice === null}
              onClick={() => draft.mutate()}
              title={finalPrice === null ? "Set a final commercial price first" : undefined}
            >
              <FileText data-icon="inline-start" /> Draft proposal
            </SavingButton>
            {finalPrice === null ? <p className="self-center text-xs text-muted-foreground">Set a final price before drafting a proposal.</p> : null}
          </div>
        </form>
      ) : null}

      {enquiry.proposals.length ? (
        <div className="mt-6 border-t border-border pt-6">
          <h3 className="text-sm font-semibold">Proposals</h3>
          <ul className="mt-3 grid gap-2">
            {enquiry.proposals.map((proposal) => (
              <li key={proposal.id}>
                <Link href={`/admin/proposals/${proposal.id}`} className="flex items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 text-sm hover:border-primary/40">
                  <span className="font-medium">Version {proposal.version}</span>
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs">{gbp(proposal.finalPriceGbp)}</span>
                    <Pill tone={proposalTone[proposal.status]}>{proposal.status}</Pill>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {price.isError ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-destructive">
          <RotateCcw className="size-4" aria-hidden="true" /> {price.error.message}
        </p>
      ) : null}
    </Panel>
  )
}
