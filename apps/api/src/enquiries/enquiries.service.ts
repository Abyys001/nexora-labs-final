import { randomUUID } from "node:crypto";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { Estimate, Selection } from "@nexora/pricing";
import { and, count, desc, eq, ilike, or, sql } from "drizzle-orm";
import { DbService } from "../db/db.service.js";
import { enquiries } from "../db/schema.js";
import type { Enquiry, PriceChangeRow, ProposalRow } from "../db/schema.js";
import { NotificationsService } from "../notifications/notifications.service.js";
import { PaymentsService, type PlanWithSchedule } from "../payments/payments.service.js";
import { ProposalsService } from "../proposals/proposals.service.js";
import type { ConfigurationDto, CreateEnquiryDto } from "./dto/create-enquiry.dto.js";
import type { ListEnquiriesQueryDto } from "./dto/list-enquiries.query.dto.js";
import type { UpdateEnquiryDto } from "./dto/update-enquiry.dto.js";

export interface EnquiryResponse {
  id: string;
  source: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  projectType: string;
  budget: string;
  description: string;
  preferredContact: string;
  industry: string | null;
  companySize: string | null;
  website: string | null;
  features: string[] | null;
  timeline: string | null;
  startDate: string | null;
  configuration: ConfigurationDto | null;
  status: string;
  notes: string | null;
  userAgent: string | null;
  reference: string | null;
  selection: Selection | null;
  estimate: Estimate | null;
  estimateGbp: number | null;
  currency: string | null;
  exchangeRate: number | null;
  rateRecordedAt: string | null;
  finalPriceGbp: number | null;
  projectDetails: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnquiryDetailResponse extends EnquiryResponse {
  priceChanges: PriceChangeRow[];
  proposals: ProposalRow[];
  paymentPlan: PlanWithSchedule | null;
  paymentStatus: string;
}

export interface CreateEnquiryContext {
  ipHash: string | null;
  userAgent: string | null;
}

export interface EnquiryListResult {
  items: EnquiryResponse[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EnquiryStats {
  total: number;
  byStatus: Record<string, number>;
}

function toResponse(row: Enquiry): EnquiryResponse {
  const { ipHash: _ipHash, accessTokenHash: _accessTokenHash, createdAt, updatedAt, rateRecordedAt, ...rest } = row;
  return {
    ...rest,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    rateRecordedAt: rateRecordedAt?.toISOString() ?? null,
  };
}

@Injectable()
export class EnquiriesService {
  constructor(
    private readonly dbService: DbService,
    private readonly notificationsService: NotificationsService,
    private readonly proposalsService: ProposalsService,
    private readonly paymentsService: PaymentsService,
  ) {}

  /** Honeypot hits report success without touching the database or sending a notification. */
  async create(dto: CreateEnquiryDto, context: CreateEnquiryContext): Promise<{ id: string }> {
    if (dto.hp) {
      return { id: randomUUID() };
    }

    const { hp: _hp, ...values } = dto;
    const [row] = await this.dbService.db
      .insert(enquiries)
      .values({ ...values, ipHash: context.ipHash, userAgent: context.userAgent })
      .returning();

    void this.notificationsService.notifyNewEnquiry(row);
    return { id: row.id };
  }

  async list(query: ListEnquiriesQueryDto): Promise<EnquiryListResult> {
    const conditions = [];
    if (query.status) {
      conditions.push(eq(enquiries.status, query.status));
    }
    if (query.source) {
      conditions.push(eq(enquiries.source, query.source));
    }
    if (query.q) {
      const term = `%${query.q}%`;
      conditions.push(
        or(ilike(enquiries.name, term), ilike(enquiries.email, term), ilike(enquiries.company, term), ilike(enquiries.reference, term)),
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const [{ value: total }] = await this.dbService.db
      .select({ value: count() })
      .from(enquiries)
      .where(where);

    const rows = await this.dbService.db
      .select()
      .from(enquiries)
      .where(where)
      .orderBy(desc(enquiries.createdAt))
      .limit(query.pageSize)
      .offset((query.page - 1) * query.pageSize);

    return {
      items: rows.map(toResponse),
      total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }

  async stats(): Promise<EnquiryStats> {
    const rows = await this.dbService.db
      .select({ status: enquiries.status, value: count() })
      .from(enquiries)
      .groupBy(enquiries.status);

    const byStatus: Record<string, number> = {};
    let total = 0;
    for (const row of rows) {
      byStatus[row.status] = row.value;
      total += row.value;
    }
    return { total, byStatus };
  }

  async findById(id: string): Promise<EnquiryResponse> {
    const [row] = await this.dbService.db.select().from(enquiries).where(eq(enquiries.id, id)).limit(1);
    if (!row) {
      throw new NotFoundException("Enquiry not found");
    }
    return toResponse(row);
  }

  /** Full admin detail view — adds price history, proposals and the payment plan/status. */
  async findDetailById(id: string): Promise<EnquiryDetailResponse> {
    const base = await this.findById(id);
    const [priceChanges, proposals, paymentStatus] = await Promise.all([
      this.proposalsService.priceChangesFor(id),
      this.proposalsService.listByEnquiry(id),
      this.paymentsService.getRequestPaymentStatus(id),
    ]);
    const latestProposal = proposals[0];
    const paymentPlan = latestProposal ? await this.paymentsService.getPlanByProposal(latestProposal.id) : null;

    return { ...base, priceChanges, proposals, paymentPlan, paymentStatus };
  }

  async update(id: string, dto: UpdateEnquiryDto): Promise<EnquiryResponse> {
    const [row] = await this.dbService.db
      .update(enquiries)
      .set({ ...dto, updatedAt: sql`now()` })
      .where(eq(enquiries.id, id))
      .returning();
    if (!row) {
      throw new NotFoundException("Enquiry not found");
    }
    return toResponse(row);
  }
}
