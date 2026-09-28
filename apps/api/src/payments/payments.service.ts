import { ConflictException, Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { buildSchedule, deriveRequestPaymentStatus, deriveScheduleItemStatus } from "@nexora/pricing";
import type { RequestPaymentStatus } from "@nexora/pricing";
import { desc, eq, inArray } from "drizzle-orm";
import { AuditLogService } from "../audit/audit-log.service.js";
import { CurrenciesService } from "../currencies/currencies.service.js";
import { DbService } from "../db/db.service.js";
import {
  paymentPlans,
  paymentScheduleItems,
  payments,
  proposals,
  type PaymentPlanRow,
  type PaymentRow,
  type PaymentScheduleItemRow,
} from "../db/schema.js";
import { PricingService } from "../pricing/pricing.service.js";
import type { CreatePaymentPlanDto } from "./dto/create-payment-plan.dto.js";
import type { RecordPaymentDto } from "./dto/record-payment.dto.js";

export interface PlanWithSchedule {
  plan: PaymentPlanRow;
  items: PaymentScheduleItemRow[];
}

export interface AdminPaymentSummary {
  enquiryId: string;
  proposalId: string;
  plan: PaymentPlanRow["plan"];
  totalGbp: number;
  paidGbp: number;
  remainingGbp: number;
  nextDue: { dueDate: string; amountGbp: number } | null;
  status: RequestPaymentStatus;
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private timer?: NodeJS.Timeout;

  constructor(
    private readonly dbService: DbService,
    private readonly auditLog: AuditLogService,
    private readonly currenciesService: CurrenciesService,
    private readonly pricingService: PricingService,
  ) {}

  /** Recomputes every open schedule item's status once a day so `overdue` catches up even without a ledger write. */
  scheduleStatusRecompute(): void {
    this.timer = setInterval(() => void this.recomputeAll(), 24 * 60 * 60 * 1000);
    this.timer.unref();
  }

  stopSchedule(): void {
    clearInterval(this.timer);
  }

  async createPlan(enquiryId: string, timelineId: string, dto: CreatePaymentPlanDto, actorAdminId: string | null): Promise<PlanWithSchedule> {
    const db = this.dbService.db;
    const [proposal] = await db
      .select()
      .from(proposals)
      .where(eq(proposals.enquiryId, enquiryId))
      .orderBy(desc(proposals.version))
      .limit(1);
    if (!proposal || proposal.status !== "published") {
      throw new ConflictException("No published proposal to accept");
    }

    const [existingPlan] = await db.select().from(paymentPlans).where(eq(paymentPlans.proposalId, proposal.id)).limit(1);
    if (existingPlan) {
      throw new ConflictException("A payment plan already exists for this proposal");
    }

    const catalog = await this.pricingService.getCatalog();
    const timeline = catalog.timelines.find((t) => t.id === timelineId);
    const weeks = timeline?.weeks ?? 8;
    const rounding = proposal.currency === "GBP" ? undefined : await this.currenciesService.getRounding(proposal.currency);

    let scheduleItems;
    try {
      scheduleItems = buildSchedule({
        plan: dto.plan,
        totalGbp: proposal.finalPriceGbp,
        acceptanceDate: new Date(),
        timelineWeeks: weeks,
        secondDueDate: dto.secondDueDate,
        currency: proposal.currency === "GBP" || !rounding ? undefined : { rate: proposal.exchangeRate ?? 1, rounding },
      });
    } catch (error) {
      throw new UnprocessableEntityException((error as Error).message);
    }

    const [plan] = await db
      .insert(paymentPlans)
      .values({ proposalId: proposal.id, plan: dto.plan, secondDueDate: dto.secondDueDate ?? null })
      .returning();

    const now = new Date();
    const items = await db
      .insert(paymentScheduleItems)
      .values(
        scheduleItems.map((item) => ({
          planId: plan.id,
          sequence: item.sequence,
          label: item.label,
          amountGbp: item.amountGbp,
          amountInCurrency: item.amountInCurrency ?? null,
          dueDate: item.dueDate,
          status: deriveScheduleItemStatus({ amountGbp: item.amountGbp, paidGbp: 0, dueDate: item.dueDate, now }),
        })),
      )
      .returning();

    await db.update(proposals).set({ status: "accepted", acceptedAt: now, updatedAt: now }).where(eq(proposals.id, proposal.id));
    await this.auditLog.record({
      adminId: actorAdminId,
      action: "accept",
      entity: "proposal",
      entityId: proposal.id,
      before: { status: "published" },
      after: { status: "accepted", plan: dto.plan },
      reason: "Customer selected a payment plan",
    });

    return { plan, items };
  }

  async getPlanByProposal(proposalId: string): Promise<PlanWithSchedule | null> {
    const [plan] = await this.dbService.db.select().from(paymentPlans).where(eq(paymentPlans.proposalId, proposalId)).limit(1);
    if (!plan) return null;
    const items = await this.dbService.db
      .select()
      .from(paymentScheduleItems)
      .where(eq(paymentScheduleItems.planId, plan.id))
      .orderBy(paymentScheduleItems.sequence);
    return { plan, items };
  }

  async getRequestPaymentStatus(enquiryId: string): Promise<RequestPaymentStatus> {
    const [proposal] = await this.dbService.db
      .select()
      .from(proposals)
      .where(eq(proposals.enquiryId, enquiryId))
      .orderBy(desc(proposals.version))
      .limit(1);
    if (!proposal) return "not-started";
    const planWithSchedule = await this.getPlanByProposal(proposal.id);
    if (!planWithSchedule) return "not-started";
    return deriveRequestPaymentStatus({
      planExists: true,
      planCancelled: planWithSchedule.plan.cancelled,
      itemStatuses: planWithSchedule.items.map((i) => i.status),
    });
  }

  async recordPayment(dto: RecordPaymentDto, adminId: string): Promise<PaymentRow> {
    const [item] = await this.dbService.db
      .select()
      .from(paymentScheduleItems)
      .where(eq(paymentScheduleItems.id, dto.scheduleItemId))
      .limit(1);
    if (!item) throw new NotFoundException("Schedule item not found");

    const [row] = await this.dbService.db
      .insert(payments)
      .values({
        scheduleItemId: dto.scheduleItemId,
        amountGbp: dto.amountGbp,
        currency: "GBP",
        method: dto.method,
        status: "succeeded",
        recordedBy: adminId,
        note: dto.note ?? null,
      })
      .returning();

    await this.recomputeItem(item.id);
    await this.auditLog.record({ adminId, action: "create", entity: "payment", entityId: row.id, before: null, after: row });
    return row;
  }

  async recordStripePayment(scheduleItemId: string, amountGbp: number, providerRef: string): Promise<PaymentRow | null> {
    const [existing] = await this.dbService.db.select().from(payments).where(eq(payments.providerRef, providerRef)).limit(1);
    if (existing) return existing; // idempotent on providerRef

    const [row] = await this.dbService.db
      .insert(payments)
      .values({ scheduleItemId, amountGbp, currency: "GBP", method: "stripe", status: "succeeded", providerRef })
      .returning();
    await this.recomputeItem(scheduleItemId);
    await this.auditLog.record({ adminId: null, action: "create", entity: "payment", entityId: row.id, before: null, after: row, reason: "Stripe webhook" });
    return row;
  }

  async refundByProviderRef(providerRef: string): Promise<void> {
    const [payment] = await this.dbService.db.select().from(payments).where(eq(payments.providerRef, providerRef)).limit(1);
    if (!payment || payment.status === "refunded") return;
    await this.dbService.db.update(payments).set({ status: "refunded" }).where(eq(payments.id, payment.id));
    await this.recomputeItem(payment.scheduleItemId);
    await this.auditLog.record({ adminId: null, action: "refund", entity: "payment", entityId: payment.id, before: payment, after: { status: "refunded" }, reason: "Stripe webhook" });
  }

  async refund(paymentId: string, adminId: string, reason: string): Promise<PaymentRow> {
    const [payment] = await this.dbService.db.select().from(payments).where(eq(payments.id, paymentId)).limit(1);
    if (!payment) throw new NotFoundException("Payment not found");
    if (payment.status === "refunded") throw new ConflictException("Payment already refunded");

    const [row] = await this.dbService.db.update(payments).set({ status: "refunded" }).where(eq(payments.id, paymentId)).returning();
    await this.recomputeItem(payment.scheduleItemId);
    await this.auditLog.record({ adminId, action: "refund", entity: "payment", entityId: paymentId, before: payment, after: row, reason });
    return row;
  }

  async cancelPlan(planId: string, adminId: string, reason: string): Promise<PaymentPlanRow> {
    const [plan] = await this.dbService.db.select().from(paymentPlans).where(eq(paymentPlans.id, planId)).limit(1);
    if (!plan) throw new NotFoundException("Payment plan not found");

    const [row] = await this.dbService.db
      .update(paymentPlans)
      .set({ cancelled: true, cancelledAt: new Date() })
      .where(eq(paymentPlans.id, planId))
      .returning();

    const items = await this.dbService.db.select().from(paymentScheduleItems).where(eq(paymentScheduleItems.planId, planId));
    const unpaid = items.filter((i) => i.status !== "paid").map((i) => i.id);
    if (unpaid.length > 0) {
      await this.dbService.db.update(paymentScheduleItems).set({ status: "cancelled", updatedAt: new Date() }).where(inArray(paymentScheduleItems.id, unpaid));
    }
    await this.auditLog.record({ adminId, action: "cancel", entity: "payment_plan", entityId: planId, before: plan, after: row, reason });
    return row;
  }

  private async recomputeItem(scheduleItemId: string): Promise<void> {
    const [item] = await this.dbService.db.select().from(paymentScheduleItems).where(eq(paymentScheduleItems.id, scheduleItemId)).limit(1);
    if (!item) return;
    const rows = await this.dbService.db.select().from(payments).where(eq(payments.scheduleItemId, scheduleItemId));
    const paidGbp = rows.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amountGbp, 0);

    const [plan] = await this.dbService.db.select().from(paymentPlans).where(eq(paymentPlans.id, item.planId)).limit(1);
    const manualStatus = plan?.cancelled ? ("cancelled" as const) : undefined;
    const status = deriveScheduleItemStatus({ amountGbp: item.amountGbp, paidGbp, dueDate: item.dueDate, manualStatus });
    if (status !== item.status) {
      await this.dbService.db.update(paymentScheduleItems).set({ status, updatedAt: new Date() }).where(eq(paymentScheduleItems.id, scheduleItemId));
    }
  }

  async recomputeAll(): Promise<void> {
    const items = await this.dbService.db.select().from(paymentScheduleItems);
    for (const item of items) {
      if (item.status === "paid" || item.status === "cancelled" || item.status === "refunded") continue;
      await this.recomputeItem(item.id);
    }
    this.logger.log(`Recomputed ${items.length} payment schedule item statuses`);
  }

  async adminList(): Promise<AdminPaymentSummary[]> {
    const rows = await this.dbService.db
      .select({ proposal: proposals, plan: paymentPlans })
      .from(paymentPlans)
      .innerJoin(proposals, eq(paymentPlans.proposalId, proposals.id));

    const summaries: AdminPaymentSummary[] = [];
    for (const { proposal, plan } of rows) {
      const items = await this.dbService.db
        .select()
        .from(paymentScheduleItems)
        .where(eq(paymentScheduleItems.planId, plan.id))
        .orderBy(paymentScheduleItems.sequence);
      const paidGbp = items.filter((i) => i.status === "paid" || i.status === "partially-paid").length
        ? await this.sumPaid(items.map((i) => i.id))
        : 0;
      const nextDueItem = items.find((i) => i.status === "awaiting" || i.status === "overdue" || i.status === "partially-paid");
      summaries.push({
        enquiryId: proposal.enquiryId,
        proposalId: proposal.id,
        plan: plan.plan,
        totalGbp: proposal.finalPriceGbp,
        paidGbp,
        remainingGbp: proposal.finalPriceGbp - paidGbp,
        nextDue: nextDueItem ? { dueDate: nextDueItem.dueDate, amountGbp: nextDueItem.amountGbp } : null,
        status: deriveRequestPaymentStatus({ planExists: true, planCancelled: plan.cancelled, itemStatuses: items.map((i) => i.status) }),
      });
    }
    return summaries;
  }

  private async sumPaid(scheduleItemIds: string[]): Promise<number> {
    if (scheduleItemIds.length === 0) return 0;
    const rows = await this.dbService.db.select().from(payments).where(inArray(payments.scheduleItemId, scheduleItemIds));
    return rows.filter((p) => p.status === "succeeded").reduce((sum, p) => sum + p.amountGbp, 0);
  }
}
