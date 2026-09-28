import path from "node:path";
import { fileURLToPath } from "node:url";
import { migrate as migrateNodePostgres } from "drizzle-orm/node-postgres/migrator";
import type { Database } from "./client.js";
import { isPgliteUrl } from "./client.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(dirname, "..", "..", "drizzle");

export async function runMigrations(db: Database, databaseUrl: string): Promise<void> {
  if (isPgliteUrl(databaseUrl)) {
    const { migrate: migratePglite } = await import("drizzle-orm/pglite/migrator");
    await migratePglite(db as never, { migrationsFolder });
    return;
  }
  await migrateNodePostgres(db as never, { migrationsFolder });
}
