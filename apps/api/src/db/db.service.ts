import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.schema.js";
import { createDatabase, type Database } from "./client.js";
import { runMigrations } from "./migrate.js";

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DbService.name);
  private _db?: Database;
  private closeFn?: () => Promise<void>;

  constructor(private readonly config: ConfigService<Env, true>) {}

  get db(): Database {
    if (!this._db) {
      throw new Error("Database accessed before initialization");
    }
    return this._db;
  }

  async onModuleInit(): Promise<void> {
    const databaseUrl = this.config.get("DATABASE_URL", { infer: true });
    const { db, close } = await createDatabase(databaseUrl);
    this._db = db;
    this.closeFn = close;
    await runMigrations(db, databaseUrl);
    this.logger.log("Database connected and migrations applied");
  }

  async onModuleDestroy(): Promise<void> {
    await this.closeFn?.();
  }
}
