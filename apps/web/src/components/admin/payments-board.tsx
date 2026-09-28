"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Ban, Receipt } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import { useCan } from "./admin-context"
import {
  cancelPaymentPlan,
  fetchEnquiry,
  fetchPayments,
  paymentKeys,
  recordPayment,
  type AdminPaymentSummary,
  type RequestPaymentStatus,
} from "./api"
import { EmptyState, ErrorBlock, gbp, LoadingBlock, PageHeader, Panel, Pill, SavingButton, shortDate, StatTile, TableScroll } from "./ui"

const planLabels = { full: "100% upfront", "split-completion": "50 / 50 on completion", "split-development": "50% + 50% in build" } as const

const statusTone: Record<RequestPaymentStatus, "neutral" | "positive" | "warning" | "danger"> = {
  "not-started": "neutral",
  "awaiting-payment": "warning",
  "partially-paid": "warning",
  paid: "positive",
  overdue: "danger",
  cancelled: "neutral",
  refunded: "neutral",
}

const statusLabels: Record<RequestPaymentStatus, string> = {
  "not-started": "Not started",
  "awaiting-payment": "Awaiting payment",
  "partially-paid": "Partially paid",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
  refunded: "Refunded",
}

/** Every accepted proposal with a payment plan, its ledger and what's still owed. */
export function PaymentsBoard() {
  const query = useQuery({ queryKey: paymentKeys.list, queryFn: fetchPayments })

  if (query.isPending) {
    return (
      <>
        <PageHeader title="Payments" description="Payment plans, schedules and the ledger behind every status." />
        <LoadingBlock label="Loading payments" rows={4} />
      </>
    )
  }
  if (query.isError) {
    return (
      <>
        <PageHeader title="Payments" />
        <ErrorBlock error={query.error} onRetry={() => query.refetch()} />
      </>
    )
  }

  const rows = query.data
  const totals = rows.reduce(
    (acc, row) => ({ total: acc.total + row.totalGbp, paid: acc.paid + row.paidGbp, remaining: acc.remaining + row.remainingGbp }),
    { total: 0, paid: 0, remaining: 0 },
  )
  const overdue = rows.filter((row) => row.status === "overdue").length

  return (
    <>
      <PageHeader
        title="Payments"
        description="Statuses are derived from the recorded ledger and each instalment's due date — never from anything the customer's browser reports."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Contracted value" value={gbp(totals.total)} />
        <StatTile label="Received" value={gbp(totals.paid)} tone="positive" />
        <StatTile label="Outstanding" value={gbp(totals.remaining)} tone={totals.remaining > 0 ? "warning" : "default"} />
        <StatTile label="Overdue plans" value={overdue} tone={overdue > 0 ? "warning" : "positive"} />
      </div>

      <Panel title="Payment plans" className="mt-8">
        {rows.length === 0 ? (
          <EmptyState
            title="No payment plans yet"
            description="A plan appears here once a customer accepts a published proposal and chooses how they'd like to pay."
          />
        ) : (
          <TableScroll>
            <table className="w-full min-w-[52rem] text-sm">
              <thead>
                <tr className="border-b border-border text-left font-mono text-[0.65rem] tracking-[0.1em] text-muted-foreground uppercase">
                  <th className="py-2 pr-4 font-medium">Request</th>
                  <th className="py-2 pr-4 font-medium">Plan</th>
                  <th className="py-2 pr-4 font-medium">Total</th>
                  <th className="py-2 pr-4 font-medium">Paid</th>
                  <th className="py-2 pr-4 font-medium">Remaining</th>
                  <th className="py-2 pr-4 font-medium">Next due</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 font-medium sr-only">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <PaymentRow key={row.proposalId} row={row} />
                ))}
              </tbody>
            </table>
          </TableScroll>
        )}
      </Panel>
    </>
  )
}

function PaymentRow({ row }: { row: AdminPaymentSummary }) {
  const canEdit = useCan("manager")
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-3 pr-4">
        <Link href={`/admin/requests/${row.enquiryId}`} className="font-medium hover:text-primary">
          {row.enquiryId.slice(0, 8)}
        </Link>
      </td>
      <td className="py-3 pr-4 text-xs">{planLabels[row.plan]}</td>
      <td className="py-3 pr-4 font-mono text-xs">{gbp(row.totalGbp)}</td>
      <td className="py-3 pr-4 font-mono text-xs text-emerald-600">{gbp(row.paidGbp)}</td>
      <td className="py-3 pr-4 font-mono text-xs">{gbp(row.remainingGbp)}</td>
      <td className="py-3 pr-4 text-xs">{row.nextDue ? `${gbp(row.nextDue.amountGbp)} · ${shortDate(row.nextDue.dueDate)}` : "—"}</td>
      <td className="py-3 pr-4">
        <Pill tone={statusTone[row.status]}>{statusLabels[row.status]}</Pill>
      </td>
      <td className="py-3">
        {canEdit ? <PaymentActions row={row} /> : null}
      </td>
    </tr>
  )
}

function PaymentActions({ row }: { row: AdminPaymentSummary }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [amount, setAmount] = useState(String(row.nextDue?.amountGbp ?? row.remainingGbp))
  const [note, setNote] = useState("")
  const [reason, setReason] = useState("")

  // The schedule lives on the request, not the summary — fetched only while the dialog is open.
  const detail = useQuery({ queryKey: ["enquiries", "detail", row.enquiryId], queryFn: () => fetchEnquiry(row.enquiryId), enabled: open || cancelOpen })
  const nextItem = detail.data?.paymentPlan?.items.find((item) => item.status !== "paid" && item.status !== "cancelled" && item.status !== "refunded")

  const record = useMutation({
    mutationFn: () => recordPayment({ scheduleItemId: nextItem!.id, amountGbp: Number(amount), method: "bank-transfer", note: note.trim() || undefined }),
    onSuccess: () => {
      toast.success("Payment recorded")
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      setOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const cancel = useMutation({
    mutationFn: () => cancelPaymentPlan(detail.data!.paymentPlan!.plan.id, reason.trim()),
    onSuccess: () => {
      toast.success("Payment plan cancelled")
      void queryClient.invalidateQueries({ queryKey: paymentKeys.all })
      void queryClient.invalidateQueries({ queryKey: ["enquiries"] })
      setCancelOpen(false)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const closed = row.status === "cancelled" || row.status === "paid" || row.status === "refunded"

  return (
    <div className="flex gap-1.5">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={closed}>
            <Receipt data-icon="inline-start" /> Record
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record a payment</DialogTitle>
            <DialogDescription>
              Records money actually received against the next open instalment. The status is then recalculated from the ledger.
            </DialogDescription>
          </DialogHeader>
          {detail.isPending ? (
            <LoadingBlock label="Loading schedule" rows={1} />
          ) : !nextItem ? (
            <p className="text-sm text-muted-foreground">There is no open instalment on this plan.</p>
          ) : (
            <div className="grid gap-4">
              <p className="rounded-lg bg-muted px-3 py-2 text-sm">
                {nextItem.label} · {gbp(nextItem.amountGbp)} · due {shortDate(nextItem.dueDate)}
              </p>
              <div className="grid gap-1.5">
                <Label htmlFor="pay-amount">Amount received (GBP)</Label>
                <Input id="pay-amount" type="number" min={1} step={1} value={amount} onChange={(e) => setAmount(e.target.value)} />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pay-note">Note</Label>
                <Textarea id="pay-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Bank reference, who confirmed it." className="min-h-20" />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" size="lg" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <SavingButton pending={record.isPending} size="lg" disabled={!nextItem || Number(amount) <= 0} onClick={() => record.mutate()}>
              Record payment
            </SavingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogTrigger asChild>
          <Button size="sm" variant="ghost" disabled={closed} aria-label="Cancel payment plan">
            <Ban className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel this payment plan</DialogTitle>
            <DialogDescription>
              Marks every unpaid instalment cancelled and records the reason in the audit log. Payments already recorded are not reversed — refund those
              individually.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="cancel-reason">Reason</Label>
            <Textarea id="cancel-reason" value={reason} onChange={(e) => setReason(e.target.value)} className="min-h-20" required />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="lg" onClick={() => setCancelOpen(false)}>
              Keep plan
            </Button>
            <SavingButton
              pending={cancel.isPending}
              size="lg"
              variant="destructive"
              disabled={reason.trim().length < 3 || !detail.data?.paymentPlan}
              onClick={() => cancel.mutate()}
            >
              Cancel plan
            </SavingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
