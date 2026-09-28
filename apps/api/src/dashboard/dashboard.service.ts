import { Injectable } from "@nestjs/common";
import { count, desc, eq, isNotNull } from "drizzle-orm";
import { DbService } from "../db/db.service.js";
import { enquiries, paymentScheduleItems } from "../db/schema.js";
import { PaymentsService } from "../payments/payments.service.js";

export interface DashboardSummary {
  byStatus: Record<string, number>;
  pipelineValueGbp: number;
  outstandingPaymentsGbp: number;
  overdueCount: number;
  recentRequests: {
    id: string;
    reference: string | null;
    name: string;
    company: string | null;
    estimateGbp: number | null;
    finalPriceGbp: number | null;
    status: string;
    createdAt: string;
  }[];
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly dbService: DbService,
    private readonly paymentsService: PaymentsService,
  ) {}

  async summary(): Promise<DashboardSummary> {
    const statusRows = await this.dbService.db.select({ status: enquiries.status, value: count() }).from(enquiries).groupBy(enquiries.status);
    const byStatus: Record<string, number> = {};
    for (const row of statusRows) byStatus[row.status] = row.value;

    const priced = await this.dbService.db
      .select({ estimateGbp: enquiries.estimateGbp, finalPriceGbp: enquiries.finalPriceGbp })
      .from(enquiries)
      .where(isNotNull(enquiries.estimateGbp));
    const pipelineValueGbp = priced.reduce((sum, row) => sum + (row.finalPriceGbp ?? row.estimateGbp ?? 0), 0);

    const payments = await this.paymentsService.adminList();
    const outstandingPaymentsGbp = payments.reduce((sum, p) => sum + Math.max(0, p.remainingGbp), 0);

    const [{ value: overdueCount }] = await this.dbService.db
      .select({ value: count() })
      .from(paymentScheduleItems)
      .where(eq(paymentScheduleItems.status, "overdue"));

    const recent = await this.dbService.db
      .select({
        id: enquiries.id,
        reference: enquiries.reference,
        name: enquiries.name,
        company: enquiries.company,
        estimateGbp: enquiries.estimateGbp,
        finalPriceGbp: enquiries.finalPriceGbp,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
      })
      .from(enquiries)
      .orderBy(desc(enquiries.createdAt))
      .limit(10);

    return {
      byStatus,
      pipelineValueGbp,
      outstandingPaymentsGbp,
      overdueCount,
      recentRequests: recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    };
  }
}
