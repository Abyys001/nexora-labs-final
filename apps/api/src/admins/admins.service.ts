import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { and, count, eq, ne } from "drizzle-orm";
import { AuditLogService } from "../audit/audit-log.service.js";
import { hashPassword } from "../auth/password.util.js";
import { DbService } from "../db/db.service.js";
import { admins, type Admin } from "../db/schema.js";
import type { CreateAdminDto, UpdateAdminDto } from "./dto/admin.dto.js";

export type AdminSummary = Omit<Admin, "passwordHash">;

function toSummary(row: Admin): AdminSummary {
  const { passwordHash: _passwordHash, ...rest } = row;
  return rest;
}

@Injectable()
export class AdminsService {
  constructor(
    private readonly dbService: DbService,
    private readonly auditLog: AuditLogService,
  ) {}

  async list(): Promise<AdminSummary[]> {
    const rows = await this.dbService.db.select().from(admins);
    return rows.map(toSummary);
  }

  async create(dto: CreateAdminDto, actorAdminId: string): Promise<AdminSummary> {
    const [existing] = await this.dbService.db.select().from(admins).where(eq(admins.email, dto.email)).limit(1);
    if (existing) throw new ConflictException("An admin with this email already exists");

    const [row] = await this.dbService.db
      .insert(admins)
      .values({ email: dto.email, name: dto.name, role: dto.role, passwordHash: await hashPassword(dto.password) })
      .returning();
    const summary = toSummary(row);
    await this.auditLog.record({ adminId: actorAdminId, action: "create", entity: "admin", entityId: row.id, before: null, after: summary });
    return summary;
  }

  async update(id: string, dto: UpdateAdminDto, actorAdminId: string): Promise<AdminSummary> {
    const [before] = await this.dbService.db.select().from(admins).where(eq(admins.id, id)).limit(1);
    if (!before) throw new NotFoundException("Admin not found");

    if (dto.role && dto.role !== "owner" && before.role === "owner") {
      await this.assertNotLastOwner(id);
    }

    const patch: Partial<typeof admins.$inferInsert> = { updatedAt: new Date() };
    if (dto.role) patch.role = dto.role;
    if (dto.name) patch.name = dto.name;
    if (dto.password) patch.passwordHash = await hashPassword(dto.password);

    const [row] = await this.dbService.db.update(admins).set(patch).where(eq(admins.id, id)).returning();
    const summary = toSummary(row);
    await this.auditLog.record({
      adminId: actorAdminId,
      action: "update",
      entity: "admin",
      entityId: id,
      before: toSummary(before),
      after: summary,
    });
    return summary;
  }

  /** Throws if `id` is currently the only owner — the last owner can never be demoted. */
  private async assertNotLastOwner(id: string): Promise<void> {
    const [{ value: otherOwners }] = await this.dbService.db
      .select({ value: count() })
      .from(admins)
      .where(and(eq(admins.role, "owner"), ne(admins.id, id)));
    if (otherOwners === 0) {
      throw new ConflictException("Cannot demote the last owner");
    }
  }
}
