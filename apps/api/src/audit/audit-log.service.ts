import { Injectable } from "@nestjs/common";
import { and, count, desc, eq } from "drizzle-orm";
import { DbService } from "../db/db.service.js";
import { auditLogs } from "../db/schema.js";

export interface RecordAuditLogInput {
  adminId: string | null;
  action: string;
  entity: string;
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
}

export interface AuditLogListResult {
  items: (typeof auditLogs.$inferSelect)[];
  total: number;
  page: number;
  pageSize: number;
}

/** Every admin write goes through here — one place that guarantees the before/after trail. */
@Injectable()
export class AuditLogService {
  constructor(private readonly dbService: DbService) {}

  async record(input: RecordAuditLogInput): Promise<void> {
    await this.dbService.db.insert(auditLogs).values({
      adminId: input.adminId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      reason: input.reason ?? null,
    });
  }

  async list(params: { entity?: string; page: number; pageSize: number }): Promise<AuditLogListResult> {
    const where = params.entity ? eq(auditLogs.entity, params.entity) : undefined;
    const [{ value: total }] = await this.dbService.db
      .select({ value: count() })
      .from(auditLogs)
      .where(where ? and(where) : undefined);

    const items = await this.dbService.db
      .select()
      .from(auditLogs)
      .where(where ? and(where) : undefined)
      .orderBy(desc(auditLogs.createdAt))
      .limit(params.pageSize)
      .offset((params.page - 1) * params.pageSize);

    return { items, total, page: params.page, pageSize: params.pageSize };
  }
}
