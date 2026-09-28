import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { and, asc, count, eq } from "drizzle-orm";
import { AuditLogService } from "../audit/audit-log.service.js";
import { DbService } from "../db/db.service.js";
import { projects, type ProjectRow } from "../db/schema.js";
import { defaultProjects } from "./default-projects.js";
import type { CreateProjectDto, UpdateProjectDto } from "./dto/project.dto.js";

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Seeds the portfolio on first boot. Never overwrites an existing table. */
  async seedIfEmpty(): Promise<void> {
    const [{ value: existing }] = await this.dbService.db.select({ value: count() }).from(projects);
    if (existing > 0) return;
    await this.dbService.db.insert(projects).values(defaultProjects);
    this.logger.log(`Seeded ${defaultProjects.length} portfolio projects`);
  }

  /** Published projects, in display order. */
  listPublic(options: { homepageOnly?: boolean } = {}): Promise<ProjectRow[]> {
    const where = options.homepageOnly
      ? and(eq(projects.status, "published"), eq(projects.homepageVisible, true))
      : eq(projects.status, "published");
    return this.dbService.db.select().from(projects).where(where).orderBy(asc(projects.sortOrder), asc(projects.title));
  }

  async getPublicBySlug(slug: string): Promise<ProjectRow> {
    const [row] = await this.dbService.db
      .select()
      .from(projects)
      .where(and(eq(projects.slug, slug), eq(projects.status, "published")))
      .limit(1);
    if (!row) throw new NotFoundException("Project not found");
    return row;
  }

  listAll(): Promise<ProjectRow[]> {
    return this.dbService.db.select().from(projects).orderBy(asc(projects.sortOrder), asc(projects.title));
  }

  async getById(id: string): Promise<ProjectRow> {
    const [row] = await this.dbService.db.select().from(projects).where(eq(projects.id, id)).limit(1);
    if (!row) throw new NotFoundException("Project not found");
    return row;
  }

  async create(dto: CreateProjectDto, adminId: string): Promise<ProjectRow> {
    const [existing] = await this.dbService.db.select().from(projects).where(eq(projects.slug, dto.slug)).limit(1);
    if (existing) throw new ConflictException(`A project with the slug "${dto.slug}" already exists`);

    const [row] = await this.dbService.db.insert(projects).values(dto).returning();
    await this.auditLog.record({ adminId, action: "create", entity: "project", entityId: row.id, before: null, after: row });
    return row;
  }

  async update(id: string, dto: UpdateProjectDto, adminId: string): Promise<ProjectRow> {
    const before = await this.getById(id);
    if (dto.slug && dto.slug !== before.slug) {
      const [clash] = await this.dbService.db.select().from(projects).where(eq(projects.slug, dto.slug)).limit(1);
      if (clash) throw new ConflictException(`A project with the slug "${dto.slug}" already exists`);
    }

    const [row] = await this.dbService.db
      .update(projects)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "update", entity: "project", entityId: id, before, after: row });
    return row;
  }

  /** Archiving, not deleting: a project's slug may already be linked from elsewhere. */
  async archive(id: string, adminId: string): Promise<ProjectRow> {
    const before = await this.getById(id);
    const [row] = await this.dbService.db
      .update(projects)
      .set({ status: "archived", homepageVisible: false, featured: false, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "archive", entity: "project", entityId: id, before, after: row });
    return row;
  }
}
