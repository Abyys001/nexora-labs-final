import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { eq } from "drizzle-orm";
import type { Env } from "../config/env.schema.js";
import { DbService } from "../db/db.service.js";
import { admins } from "../db/schema.js";
import { hashPassword, verifyPassword } from "./password.util.js";

/** Called explicitly from main.ts after app init, so it runs strictly after migrations. */
@Injectable()
export class AdminSeedService {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    private readonly dbService: DbService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async seed(): Promise<void> {
    const email = this.config.get("ADMIN_EMAIL", { infer: true });
    const password = this.config.get("ADMIN_PASSWORD", { infer: true });
    if (!email || !password) {
      this.logger.log("ADMIN_EMAIL/ADMIN_PASSWORD not set, skipping admin seed");
      return;
    }
    const name = this.config.get("ADMIN_NAME", { infer: true }) ?? "Admin";
    const db = this.dbService.db;

    const [existing] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (!existing) {
      await db.insert(admins).values({ email, name, passwordHash: await hashPassword(password), role: "owner" });
      this.logger.log(`Seeded admin account for ${email}`);
      return;
    }

    const passwordUnchanged = await verifyPassword(password, existing.passwordHash);
    if (passwordUnchanged && existing.name === name && existing.role === "owner") {
      return;
    }
    await db
      .update(admins)
      .set({ passwordHash: await hashPassword(password), name, role: "owner", updatedAt: new Date() })
      .where(eq(admins.id, existing.id));
    this.logger.log(`Updated admin account for ${email}`);
  }
}
