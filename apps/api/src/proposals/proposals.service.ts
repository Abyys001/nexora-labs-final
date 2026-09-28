import { ConflictException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { convert } from "@nexora/pricing";
import { and, desc, eq, max } from "drizzle-orm";
import { AuditLogService } from "../audit/audit-log.service.js";
import { CurrenciesService } from "../currencies/currencies.service.js";
import { DbService } from "../db/db.service.js";
import { enquiries, priceChanges, proposals, type Enquiry, type ProposalRow, type PriceChangeRow } from "../db/schema.js";
import type { ProposalPdfData } from "../pdf/proposal-pdf.types.js";
import { PaymentsService } from "../payments/payments.service.js";
import { PricingService } from "../pricing/pricing.service.js";
import type { CreateProposalDto, UpdateProposalDto } from "./dto/proposal-content.dto.js";
import type { SetFinalPriceDto } from "./dto/set-final-price.dto.js";

const KIND_LABELS: Record<string, string> = {
  solution: "Solution",
  feature: "Features",
  platform: "Platforms",
  integration: "Integrations",
  ai: "AI",
  design: "Design",
  support: "Support",
  maintenance: "Maintenance",
};

function addDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * 86_400_000).toISOString().slice(0, 10);
}

@Injectable()
export class ProposalsService {
  constructor(
    private readonly dbService: DbService,
    private readonly auditLog: AuditLogService,
    private readonly currenciesService: CurrenciesService,
    private readonly pricingService: PricingService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async setFinalPrice(enquiryId: string, dto: SetFinalPriceDto, adminId: string): Promise<{ enquiryId: string; finalPriceGbp: number }> {
    const [enquiry] = await this.dbService.db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
    if (!enquiry) throw new NotFoundException("Enquiry not found");

    const previousGbp = enquiry.finalPriceGbp;
    let newGbp: number;
    if (dto.mode === "accept") {
      if (enquiry.estimateGbp === null) throw new UnprocessableEntityException("Enquiry has no automated estimate to accept");
      newGbp = enquiry.estimateGbp;
    } else if (dto.mode === "manual") {
      newGbp = dto.amountGbp!;
    } else {
      const base = enquiry.finalPriceGbp ?? enquiry.estimateGbp;
      if (base === null) throw new UnprocessableEntityException("Enquiry has no price to adjust from");
      newGbp = base + dto.deltaGbp!;
      if (newGbp < 0) throw new UnprocessableEntityException("Adjustment would make the price negative");
    }

    await this.dbService.db.update(enquiries).set({ finalPriceGbp: newGbp, updatedAt: new Date() }).where(eq(enquiries.id, enquiryId));
    await this.dbService.db.insert(priceChanges).values({ enquiryId, adminId, previousGbp, newGbp, mode: dto.mode, reason: dto.reason });
    await this.auditLog.record({
      adminId,
      action: "set_final_price",
      entity: "enquiry",
      entityId: enquiryId,
      before: { finalPriceGbp: previousGbp },
      after: { finalPriceGbp: newGbp },
      reason: dto.reason,
    });
    return { enquiryId, finalPriceGbp: newGbp };
  }

  async priceChangesFor(enquiryId: string): Promise<PriceChangeRow[]> {
    return this.dbService.db.select().from(priceChanges).where(eq(priceChanges.enquiryId, enquiryId)).orderBy(desc(priceChanges.createdAt));
  }

  async createDraft(enquiryId: string, dto: CreateProposalDto, adminId: string): Promise<ProposalRow> {
    const [enquiry] = await this.dbService.db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
    if (!enquiry) throw new NotFoundException("Enquiry not found");
    if (enquiry.finalPriceGbp === null) throw new UnprocessableEntityException("Set a final price before drafting a proposal");

    const [{ value: maxVersion }] = await this.dbService.db
      .select({ value: max(proposals.version) })
      .from(proposals)
      .where(eq(proposals.enquiryId, enquiryId));

    const [row] = await this.dbService.db
      .insert(proposals)
      .values({
        enquiryId,
        version: (maxVersion ?? 0) + 1,
        status: "draft",
        automatedEstimateGbp: enquiry.estimateGbp ?? 0,
        finalPriceGbp: enquiry.finalPriceGbp,
        currency: enquiry.currency ?? "GBP",
        content: dto.content,
        validUntil: dto.validUntil ?? addDays(new Date(), 30),
        createdBy: adminId,
      })
      .returning();

    await this.auditLog.record({ adminId, action: "create", entity: "proposal", entityId: row.id, before: null, after: row });
    return row;
  }

  async getById(id: string): Promise<ProposalRow> {
    const [row] = await this.dbService.db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
    if (!row) throw new NotFoundException("Proposal not found");
    return row;
  }

  async listByEnquiry(enquiryId: string): Promise<ProposalRow[]> {
    return this.dbService.db.select().from(proposals).where(eq(proposals.enquiryId, enquiryId)).orderBy(desc(proposals.version));
  }

  async list(): Promise<ProposalRow[]> {
    return this.dbService.db.select().from(proposals).orderBy(desc(proposals.createdAt));
  }

  async update(id: string, dto: UpdateProposalDto, adminId: string): Promise<ProposalRow> {
    const before = await this.getById(id);
    if (before.status !== "draft") throw new ConflictException("Only draft proposals can be edited");

    const [row] = await this.dbService.db
      .update(proposals)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "update", entity: "proposal", entityId: id, before, after: row });
    return row;
  }

  async publish(id: string, adminId: string): Promise<ProposalRow> {
    const before = await this.getById(id);
    if (before.status !== "draft") throw new ConflictException("Only draft proposals can be published");

    await this.dbService.db
      .update(proposals)
      .set({ status: "superseded", updatedAt: new Date() })
      .where(and(eq(proposals.enquiryId, before.enquiryId), eq(proposals.status, "published")));

    const now = new Date();
    let exchangeRate: number | null = null;
    let rateRecordedAt: Date | null = null;
    let amountInCurrency: number | null = null;
    if (before.currency !== "GBP") {
      const { rate, rounding } = await this.currenciesService.getRate(before.currency);
      exchangeRate = rate;
      rateRecordedAt = now;
      amountInCurrency = convert(before.finalPriceGbp, rate, rounding);
    }

    const [row] = await this.dbService.db
      .update(proposals)
      .set({ status: "published", publishedAt: now, exchangeRate, rateRecordedAt, amountInCurrency, updatedAt: now })
      .where(eq(proposals.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "publish", entity: "proposal", entityId: id, before, after: row });
    return row;
  }

  async withdraw(id: string, adminId: string): Promise<ProposalRow> {
    const before = await this.getById(id);
    if (before.status !== "draft" && before.status !== "published") {
      throw new ConflictException("Only draft or published proposals can be withdrawn");
    }
    const [row] = await this.dbService.db
      .update(proposals)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(eq(proposals.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "withdraw", entity: "proposal", entityId: id, before, after: row });
    return row;
  }

  /** The customer view only ever shows a published/accepted proposal, never a draft. */
  async latestPublicProposal(enquiryId: string): Promise<ProposalRow | null> {
    const rows = await this.dbService.db.select().from(proposals).where(eq(proposals.enquiryId, enquiryId)).orderBy(desc(proposals.version));
    return rows.find((p) => p.status === "published" || p.status === "accepted") ?? null;
  }

  async pdfDataForProposal(proposalId: string): Promise<ProposalPdfData> {
    const proposal = await this.getById(proposalId);
    const [enquiry] = await this.dbService.db.select().from(enquiries).where(eq(enquiries.id, proposal.enquiryId)).limit(1);
    if (!enquiry) throw new NotFoundException("Enquiry not found");
    return this.composePdfData(enquiry, proposal);
  }

  async pdfDataForEnquiry(enquiryId: string): Promise<ProposalPdfData> {
    const [enquiry] = await this.dbService.db.select().from(enquiries).where(eq(enquiries.id, enquiryId)).limit(1);
    if (!enquiry) throw new NotFoundException("Enquiry not found");
    const proposal = await this.latestPublicProposal(enquiryId);
    if (!proposal) throw new NotFoundException("No published proposal yet");
    return this.composePdfData(enquiry, proposal);
  }

  private async composePdfData(enquiry: Enquiry, proposal: ProposalRow): Promise<ProposalPdfData> {
    const catalog = await this.pricingService.getCatalog();
    const itemsById = new Map(catalog.items.map((item) => [item.id, item]));
    const selection = enquiry.selection;

    const groupIds: [string, string[]][] = selection
      ? [
          ["solution", selection.solutionTypes],
          ["feature", selection.features],
          ["platform", selection.platforms],
          ["integration", selection.integrations],
          ["ai", selection.ai],
          ["design", selection.design],
        ]
      : [];

    const featuresByKind = groupIds.map(([kind, ids]) => ({
      kind,
      label: KIND_LABELS[kind] ?? kind,
      items: ids
        .map((id) => itemsById.get(id))
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .map((item) => ({ label: item.label, price: item.price })),
    }));

    const planWithSchedule = await this.paymentsService.getPlanByProposal(proposal.id);
    const timeline = selection ? catalog.timelines.find((t) => t.id === selection.timeline) : undefined;

    return {
      reference: enquiry.reference ?? enquiry.id,
      client: { name: enquiry.name, company: enquiry.company, email: enquiry.email },
      createdAt: proposal.createdAt,
      validUntil: proposal.validUntil,
      summary: proposal.content.summary,
      scope: proposal.content.scope,
      requirements: proposal.content.requirements,
      featuresByKind,
      automatedEstimateGbp: proposal.automatedEstimateGbp,
      finalPriceGbp: proposal.finalPriceGbp,
      currency: proposal.currency,
      exchangeRate: proposal.exchangeRate,
      amountInCurrency: proposal.amountInCurrency,
      paymentPlan: planWithSchedule
        ? {
            plan: planWithSchedule.plan.plan,
            items: planWithSchedule.items.map((item) => ({
              label: item.label,
              amountGbp: item.amountGbp,
              amountInCurrency: item.amountInCurrency,
              dueDate: item.dueDate,
            })),
          }
        : null,
      timelineLabel: timeline?.label ?? null,
      assumptions: proposal.content.assumptions,
      exclusions: proposal.content.exclusions,
      nextSteps: proposal.content.nextSteps,
    };
  }
}
