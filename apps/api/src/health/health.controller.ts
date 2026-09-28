import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { sql } from "drizzle-orm";
import { DbService } from "../db/db.service.js";

@SkipThrottle()
@Controller("health")
export class HealthController {
  constructor(private readonly dbService: DbService) {}

  @Get()
  async check(): Promise<{ status: "ok"; db: "ok" | "error" }> {
    try {
      await this.dbService.db.execute(sql`select 1`);
      return { status: "ok", db: "ok" };
    } catch {
      return { status: "ok", db: "error" };
    }
  }
}
