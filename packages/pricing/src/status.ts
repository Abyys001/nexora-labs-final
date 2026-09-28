import type { RequestPaymentStatus, ScheduleStatus } from "./types.js";

/**
 * Derives a schedule item's status from its ledger and due date. `manualStatus`
 * (cancelled/refunded) always wins — those states come from admin action, not
 * from the paid amount.
 */
export function deriveScheduleItemStatus(params: {
  amountGbp: number;
  paidGbp: number;
  dueDate: Date | string;
  now?: Date;
  manualStatus?: Extract<ScheduleStatus, "cancelled" | "refunded">;
}): ScheduleStatus {
  if (params.manualStatus) return params.manualStatus;
  if (params.paidGbp >= params.amountGbp && params.amountGbp > 0) return "paid";
  if (params.paidGbp > 0) return "partially-paid";

  const now = params.now ?? new Date();
  const dueDate = typeof params.dueDate === "string" ? new Date(`${params.dueDate}T00:00:00.000Z`) : params.dueDate;
  if (now.getTime() > dueDate.getTime()) return "overdue";
  return "awaiting";
}

/**
 * Derives the request-level payment status from its schedule item statuses.
 */
export function deriveRequestPaymentStatus(params: {
  planExists: boolean;
  planCancelled?: boolean;
  itemStatuses: ScheduleStatus[];
}): RequestPaymentStatus {
  if (!params.planExists) return "not-started";
  if (params.planCancelled) return "cancelled";
  if (params.itemStatuses.length > 0 && params.itemStatuses.every((status) => status === "refunded")) return "refunded";
  if (params.itemStatuses.some((status) => status === "overdue")) return "overdue";
  if (params.itemStatuses.every((status) => status === "paid" || status === "refunded")) return "paid";
  if (params.itemStatuses.some((status) => status === "paid" || status === "partially-paid")) return "partially-paid";
  return "awaiting-payment";
}
