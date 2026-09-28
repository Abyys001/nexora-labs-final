import type { PaymentPlanKind, ScheduleInput, ScheduleItem } from "./types.js";
import { convert } from "./convert.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function toUtcMidnight(input: Date | string): Date {
  const date = typeof input === "string" ? new Date(`${input}T00:00:00.000Z`) : input;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Allowed [min, max] window for the customer-chosen second instalment date. */
export function secondInstalmentWindow(plan: PaymentPlanKind, acceptanceDate: Date | string, timelineWeeks: number): { min: string; max: string } {
  const acceptance = toUtcMidnight(acceptanceDate);
  const estimatedCompletion = addDays(acceptance, timelineWeeks * 7);

  if (plan === "split-completion") {
    return { min: isoDate(addDays(estimatedCompletion, -14)), max: isoDate(addDays(estimatedCompletion, 30)) };
  }
  if (plan === "split-development") {
    return { min: isoDate(addDays(acceptance, 14)), max: isoDate(addDays(estimatedCompletion, -7)) };
  }
  throw new Error(`Plan "${plan}" has no second instalment.`);
}

export function isSecondDueDateValid(plan: PaymentPlanKind, acceptanceDate: Date | string, timelineWeeks: number, secondDueDate: Date | string): boolean {
  const window = secondInstalmentWindow(plan, acceptanceDate, timelineWeeks);
  const candidate = isoDate(toUtcMidnight(secondDueDate));
  return candidate >= window.min && candidate <= window.max;
}

/**
 * Builds the payment schedule for a plan. Throws when a split plan is
 * missing its second date or the date falls outside the allowed window —
 * callers should validate with `isSecondDueDateValid` first to return a
 * clean 422 instead of letting this throw.
 */
export function buildSchedule(input: ScheduleInput): ScheduleItem[] {
  const acceptance = toUtcMidnight(input.acceptanceDate);
  const firstDue = addDays(acceptance, 7);
  const currency = input.currency;
  const inCurrency = (amountGbp: number) => (currency ? convert(amountGbp, currency.rate, currency.rounding) : undefined);

  if (input.plan === "full") {
    return [
      {
        sequence: 1,
        label: "Full payment",
        amountGbp: input.totalGbp,
        amountInCurrency: inCurrency(input.totalGbp),
        dueDate: isoDate(firstDue),
      },
    ];
  }

  if (!input.secondDueDate) {
    throw new Error(`Plan "${input.plan}" requires a secondDueDate.`);
  }
  if (!isSecondDueDateValid(input.plan, input.acceptanceDate, input.timelineWeeks, input.secondDueDate)) {
    const window = secondInstalmentWindow(input.plan, input.acceptanceDate, input.timelineWeeks);
    throw new RangeError(`secondDueDate must be between ${window.min} and ${window.max}.`);
  }

  // First instalment takes the remainder on odd totals.
  const secondAmount = Math.floor(input.totalGbp / 2);
  const firstAmount = input.totalGbp - secondAmount;
  const secondDue = toUtcMidnight(input.secondDueDate);
  const secondLabel = input.plan === "split-completion" ? "Completion payment (50%)" : "Final payment (50%)";

  return [
    {
      sequence: 1,
      label: "Deposit (50%)",
      amountGbp: firstAmount,
      amountInCurrency: inCurrency(firstAmount),
      dueDate: isoDate(firstDue),
    },
    {
      sequence: 2,
      label: secondLabel,
      amountGbp: secondAmount,
      amountInCurrency: inCurrency(secondAmount),
      dueDate: isoDate(secondDue),
    },
  ];
}
