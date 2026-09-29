import { randomBytes, createHash } from "node:crypto";
import { Injectable, Logger, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { convert, estimate, type Estimate, type Selection } from "@cybercina/pricing";
import { eq, sql } from "drizzle-orm";
import type { Env } from "../config/env.schema.js";
import { CurrenciesService } from "../currencies/currencies.service.js";
import { DbService } from "../db/db.service.js";
import { enquiries, type Enquiry } from "../db/schema.js";
import { NotificationsService } from "../notifications/notifications.service.js";
import { PaymentsService, type PlanWithSchedule } from "../payments/payments.service.js";
import { PricingService } from "../pricing/pricing.service.js";
import { ProposalsService } from "../proposals/proposals.service.js";
import type { CreatePaymentPlanDto } from "../payments/dto/create-payment-plan.dto.js";
import type { CreateProjectRequestDto } from "./dto/create-project-request.dto.js";

/** Maps the new catalogue's solution ids onto the legacy `project_type` enum column. */
const SOLUTION_PROJECT_TYPE: Record<string, Enquiry["projectType"]> = {
  website: "website",
  "web-app": "web-app",
  "mobile-app": "mobile-app",
  saas: "saas",
  crm: "crm",
  ecommerce: "ecommerce",
  ai: "ai",
  automation: "automation",
};

/** Maps the new catalogue's timeline ids onto the legacy `timeline` enum column. */
const TIMELINE_LEGACY: Record<string, Enquiry["timeline"]> = {
  flexible: "flexible",
  "3-6-months": "3-6-months",
  "2-3-months": "1-3-months",
  "1-2-months": "1-3-months",
  asap: "asap",
};

export interface SubmitResult {
  reference: string;
  accessToken: string;
  estimate: Estimate;
  currency: string;
  exchangeRate: number;
  amountInCurrency: number;
}

export interface PublicRequestView {
  reference: string;
  stage: "under-review" | "proposal-ready" | "accepted";
  selection: Selection | null;
  estimate: Estimate | null;
  currency: string | null;
  exchangeRate: number | null;
  rateRecordedAt: string | null;
  proposal: {
    id: string;
    version: number;
    status: string;
    finalPriceGbp: number;
    currency: string;
    exchangeRate: number | null;
    amountInCurrency: number | null;
    content: unknown;
    validUntil: string | null;
    publishedAt: string | null;
  } | null;
  paymentPlan: PlanWithSchedule | null;
  paymentStatus: string;
  bankDetails: string | null;
  stripeEnabled: boolean;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

@Injectable()
export class ProjectRequestsService {
  private readonly logger = new Logger(ProjectRequestsService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly pricingService: PricingService,
    private readonly currenciesService: CurrenciesService,
    private readonly notificationsService: NotificationsService,
    private readonly proposalsService: ProposalsService,
    private readonly paymentsService: PaymentsService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async submit(dto: CreateProjectRequestDto, context: { ipHash: string | null; userAgent: string | null }): Promise<SubmitResult> {
    const catalog = await this.pricingService.getCatalog();
    const est = estimate(catalog, dto.selection);

    let rate = 1;
    if (dto.currency !== "GBP") {
      const { rate: currencyRate, rounding } = await this.currenciesService.getRate(dto.currency);
      const publicCurrencies = await this.currenciesService.listPublic();
      const enabled = publicCurrencies.some((c) => c.code === dto.currency);
      if (!enabled) throw new UnprocessableEntityException(`Currency ${dto.currency} is not currently available`);
      rate = currencyRate;
      const amountInCurrency = convert(est.total, rate, rounding);

      if (dto.hp) return this.honeypotResponse(est, dto.currency, rate, amountInCurrency);
      return this.persist(dto, est, rate, amountInCurrency, context);
    }

    if (dto.hp) return this.honeypotResponse(est, "GBP", 1, est.total);
    return this.persist(dto, est, 1, est.total, context);
  }

  /** Honeypot hits look like success but touch neither the database nor email. */
  private honeypotResponse(est: Estimate, currency: string, rate: number, amountInCurrency: number): SubmitResult {
    return {
      reference: `NX-${new Date().getFullYear()}-0000`,
      accessToken: randomBytes(32).toString("base64url"),
      estimate: est,
      currency,
      exchangeRate: rate,
      amountInCurrency,
    };
  }

  private async persist(
    dto: CreateProjectRequestDto,
    est: Estimate,
    rate: number,
    amountInCurrency: number,
    context: { ipHash: string | null; userAgent: string | null },
  ): Promise<SubmitResult> {
    const catalog = await this.pricingService.getCatalog();
    const itemsById = new Map(catalog.items.map((item) => [item.id, item]));
    const primarySolutionId = dto.selection.solutionTypes[0];
    const primaryItem = primarySolutionId ? itemsById.get(primarySolutionId) : undefined;

    const labelIds = [...dto.selection.features, ...dto.selection.integrations, ...dto.selection.ai, ...dto.selection.design, ...dto.selection.platforms];
    const features = labelIds
      .map((id) => itemsById.get(id)?.label)
      .filter((label): label is string => Boolean(label))
      .slice(0, 20);

    const descriptionLines = [
      `${primaryItem?.label ?? "Project"} request submitted via the Project Builder.`,
      dto.details.goals.length ? `Goals: ${dto.details.goals.join(", ")}` : undefined,
      dto.details.industries.length ? `Industries: ${dto.details.industries.join(", ")}` : undefined,
      dto.details.successCriteria ? `Success criteria: ${dto.details.successCriteria}` : undefined,
      dto.details.designNotes ? `Design notes: ${dto.details.designNotes}` : undefined,
      dto.details.notes ? `Notes: ${dto.details.notes}` : undefined,
    ].filter((line): line is string => Boolean(line));

    const accessToken = randomBytes(32).toString("base64url");
    const accessTokenHash = hashToken(accessToken);

    const values = {
      source: "quote" as const,
      name: dto.contact.name,
      email: dto.contact.email,
      company: dto.contact.company ?? null,
      phone: dto.contact.phone ?? null,
      projectType: SOLUTION_PROJECT_TYPE[primarySolutionId ?? ""] ?? "other",
      budget: "not-sure" as const,
      description: descriptionLines.join("\n"),
      preferredContact: dto.contact.preferredContact,
      industry: dto.details.industries[0] ?? null,
      companySize: dto.contact.companySize ?? null,
      website: dto.contact.website ?? null,
      features,
      timeline: TIMELINE_LEGACY[dto.selection.timeline] ?? null,
      startDate: dto.details.startDate ?? null,
      configuration: null,
      status: "new" as const,
      ipHash: context.ipHash,
      userAgent: context.userAgent,
      accessTokenHash,
      selection: dto.selection,
      estimate: est,
      estimateGbp: est.total,
      currency: dto.currency,
      exchangeRate: rate,
      rateRecordedAt: new Date(),
      projectDetails: dto.details,
    };

    const row = await this.insertWithReference(values);

    void this.notificationsService.notifyNewProjectRequest(row, est, accessToken);
    void this.notificationsService.notifyCustomerPrivateLink(row, accessToken);

    return { reference: row.reference!, accessToken, estimate: est, currency: dto.currency, exchangeRate: rate, amountInCurrency };
  }

  /** Retries on a reference collision (unique constraint) — safe under concurrent submissions in the same year. */
  private async insertWithReference(values: Omit<typeof enquiries.$inferInsert, "reference">): Promise<Enquiry> {
    const year = new Date().getFullYear();
    const prefix = `NX-${year}-`;

    for (let attempt = 0; attempt < 5; attempt++) {
      const [{ value: existingCount }] = await this.dbService.db
        .select({ value: sql<number>`count(*)::int` })
        .from(enquiries)
        .where(sql`${enquiries.reference} like ${prefix + "%"}`);
      const reference = `${prefix}${String(existingCount + 1).padStart(4, "0")}`;

      try {
        const [row] = await this.dbService.db.insert(enquiries).values({ ...values, reference }).returning();
        return row;
      } catch (error) {
        const isUniqueViolation = (error as { code?: string }).code === "23505";
        if (!isUniqueViolation || attempt === 4) throw error;
        this.logger.warn(`Reference collision on ${reference}, retrying (attempt ${attempt + 1})`);
      }
    }
    throw new Error("Failed to allocate a unique reference after 5 attempts");
  }

  private async findByToken(token: string): Promise<Enquiry> {
    const hash = hashToken(token);
    const [row] = await this.dbService.db.select().from(enquiries).where(eq(enquiries.accessTokenHash, hash)).limit(1);
    if (!row) throw new NotFoundException("Request not found");
    return row;
  }

  async getPublicView(token: string): Promise<PublicRequestView> {
    const enquiry = await this.findByToken(token);
    const proposal = await this.proposalsService.latestPublicProposal(enquiry.id);
    const paymentPlan = proposal ? await this.paymentsService.getPlanByProposal(proposal.id) : null;
    const paymentStatus = await this.paymentsService.getRequestPaymentStatus(enquiry.id);
    const stage: PublicRequestView["stage"] = !proposal ? "under-review" : proposal.status === "accepted" ? "accepted" : "proposal-ready";

    return {
      reference: enquiry.reference ?? enquiry.id,
      stage,
      selection: enquiry.selection,
      estimate: enquiry.estimate,
      currency: enquiry.currency,
      exchangeRate: enquiry.exchangeRate,
      rateRecordedAt: enquiry.rateRecordedAt?.toISOString() ?? null,
      proposal: proposal
        ? {
            id: proposal.id,
            version: proposal.version,
            status: proposal.status,
            finalPriceGbp: proposal.finalPriceGbp,
            currency: proposal.currency,
            exchangeRate: proposal.exchangeRate,
            amountInCurrency: proposal.amountInCurrency,
            content: proposal.content,
            validUntil: proposal.validUntil,
            publishedAt: proposal.publishedAt?.toISOString() ?? null,
          }
        : null,
      paymentPlan,
      paymentStatus,
      bankDetails: this.config.get("PAYMENT_BANK_DETAILS", { infer: true }) ?? null,
      stripeEnabled: Boolean(this.config.get("STRIPE_SECRET_KEY", { infer: true })),
    };
  }

  async createPaymentPlan(token: string, dto: CreatePaymentPlanDto): Promise<PlanWithSchedule> {
    const enquiry = await this.findByToken(token);
    const timelineId = enquiry.selection?.timeline ?? "flexible";
    return this.paymentsService.createPlan(enquiry.id, timelineId, dto, null);
  }

  async getEnquiryByToken(token: string): Promise<Enquiry> {
    return this.findByToken(token);
  }
}
