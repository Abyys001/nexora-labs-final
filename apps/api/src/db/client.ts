import { drizzle as drizzleNodePostgres, type NodePgDatabase } from "drizzle-orm/node-postgres";
import type { PgliteDatabase } from "drizzle-orm/pglite";
import { Pool } from "pg";
import * as schema from "./schema.js";

export type Database = NodePgDatabase<typeof schema> | PgliteDatabase<typeof schema>;

export interface DatabaseConnection {
  db: Database;
  close: () => Promise<void>;
}

const PGLITE_SCHEME = "pglite://";

export function isPgliteUrl(databaseUrl: string): boolean {
  return databaseUrl.startsWith(PGLITE_SCHEME);
}

/**
 * Real Postgres in production; an in-process PGlite instance in tests
 * (`DATABASE_URL=pglite://memory`). PGlite is dev-only and imported
 * dynamically so it never needs to be present in the production image.
 */
export async function createDatabase(databaseUrl: string): Promise<DatabaseConnection> {
  if (isPgliteUrl(databaseUrl)) {
    const [{ PGlite }, { drizzle: drizzlePglite }] = await Promise.all([
      import("@electric-sql/pglite"),
      import("drizzle-orm/pglite"),
    ]);
    const path = databaseUrl.slice(PGLITE_SCHEME.length);
    const client = path === "" || path === "memory" ? new PGlite() : new PGlite(path);
    const db = drizzlePglite(client, { schema });
    return { db, close: () => client.close() };
  }

  const pool = new Pool({ connectionString: databaseUrl });
  const db = drizzleNodePostgres(pool, { schema });
  return { db, close: () => pool.end() };
}
