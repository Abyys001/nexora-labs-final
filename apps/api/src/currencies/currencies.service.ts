import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import type { Rounding } from "@nexora/pricing";
import { ConfigService } from "@nestjs/config";
import { desc, eq } from "drizzle-orm";
import { AuditLogService } from "../audit/audit-log.service.js";
import type { Env } from "../config/env.schema.js";
import { DbService } from "../db/db.service.js";
import { currencies, exchangeRateHistory, type CurrencyRow } from "../db/schema.js";
import type { UpdateCurrencyDto } from "./dto/update-currency.dto.js";

const DEFAULT_PROVIDER_URL = "https://api.frankfurter.app/latest?from=GBP&to=EUR,USD";
const FETCH_TIMEOUT_MS = 8000;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000;

export interface PublicCurrency {
  code: string;
  rate: number;
  rounding: string;
  rateUpdatedAt: string | null;
}

interface ProviderResponse {
  rates: Record<string, number>;
}

/** Rounding is stored as text ("none" | "1" | "10" | "50" | "100") since it mixes a literal with numbers. */
function parseRounding(value: string): Rounding {
  return value === "none" ? "none" : (Number(value) as Rounding);
}

@Injectable()
export class CurrenciesService {
  private readonly logger = new Logger(CurrenciesService.name);
  private refreshTimer?: NodeJS.Timeout;

  constructor(
    private readonly dbService: DbService,
    private readonly auditLog: AuditLogService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async seedIfEmpty(): Promise<void> {
    const [gbp] = await this.dbService.db.select().from(currencies).where(eq(currencies.code, "GBP")).limit(1);
    if (gbp) return;
    await this.dbService.db.insert(currencies).values([
      { code: "GBP", enabled: true, rate: 1, source: "manual", rounding: "none", rateUpdatedAt: new Date() },
      // Seeded as `provider` (not `manual`) so the first refresh can populate a
      // real rate — `manual` means "an admin set this" and is never overwritten.
      { code: "EUR", enabled: false, rate: 1, source: "provider", rounding: "10" },
      { code: "USD", enabled: false, rate: 1, source: "provider", rounding: "10" },
    ]);
  }

  /** Called once from main.ts after boot. Skipped entirely in tests — see docs/architecture/commercial-flow.md §4. */
  async refreshOnBootAndSchedule(): Promise<void> {
    await this.refreshIfStale();
    const hours = this.config.get("FX_REFRESH_HOURS", { infer: true });
    this.refreshTimer = setInterval(() => void this.refreshIfStale(), hours * 60 * 60 * 1000);
    this.refreshTimer.unref();
  }

  stopSchedule(): void {
    clearInterval(this.refreshTimer);
  }

  async refreshIfStale(): Promise<void> {
    const rows = await this.dbService.db.select().from(currencies);
    const stale = rows.some((row) => row.code !== "GBP" && (!row.rateUpdatedAt || Date.now() - row.rateUpdatedAt.getTime() > STALE_AFTER_MS));
    if (stale) await this.refreshNow();
  }

  async refreshNow(): Promise<void> {
    const url = this.config.get("FX_PROVIDER_URL", { infer: true }) ?? DEFAULT_PROVIDER_URL;
    try {
      const rates = await this.fetchRates(url);
      const rows = await this.dbService.db.select().from(currencies);
      for (const row of rows) {
        if (row.code === "GBP" || row.source === "manual") continue;
        const rate = rates[row.code];
        if (typeof rate !== "number") continue;
        await this.dbService.db
          .update(currencies)
          .set({ rate, enabled: true, source: "provider", rateUpdatedAt: new Date(), lastRefreshError: null })
          .where(eq(currencies.code, row.code));
        await this.dbService.db.insert(exchangeRateHistory).values({ code: row.code, rate, source: "provider" });
      }
      this.logger.log("Currency rates refreshed from provider");
    } catch (error) {
      const message = (error as Error).message;
      this.logger.error(`Currency refresh failed: ${message}`);
      await this.dbService.db
        .update(currencies)
        .set({ lastRefreshError: message })
        .where(eq(currencies.source, "provider"));
    }
  }

  private async fetchRates(url: string): Promise<Record<string, number>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error(`Provider responded ${res.status}`);
      const body = (await res.json()) as ProviderResponse;
      if (!body.rates || typeof body.rates !== "object") throw new Error("Malformed provider response");
      return body.rates;
    } finally {
      clearTimeout(timeout);
    }
  }

  async listPublic(): Promise<PublicCurrency[]> {
    const rows = await this.dbService.db.select().from(currencies).where(eq(currencies.enabled, true));
    return rows.map((row) => ({
      code: row.code,
      rate: row.rate,
      rounding: row.rounding,
      rateUpdatedAt: row.rateUpdatedAt?.toISOString() ?? null,
    }));
  }

  listAll(): Promise<CurrencyRow[]> {
    return this.dbService.db.select().from(currencies);
  }

  async getRounding(code: string): Promise<Rounding> {
    const [row] = await this.dbService.db.select().from(currencies).where(eq(currencies.code, code as CurrencyRow["code"])).limit(1);
    return row ? parseRounding(row.rounding) : "none";
  }

  async getRate(code: CurrencyRow["code"]): Promise<{ rate: number; rounding: Rounding }> {
    const [row] = await this.dbService.db.select().from(currencies).where(eq(currencies.code, code)).limit(1);
    if (!row) throw new NotFoundException(`Currency ${code} not found`);
    return { rate: row.rate, rounding: parseRounding(row.rounding) };
  }

  async update(code: CurrencyRow["code"], dto: UpdateCurrencyDto, adminId: string): Promise<CurrencyRow> {
    const [before] = await this.dbService.db.select().from(currencies).where(eq(currencies.code, code)).limit(1);
    if (!before) throw new NotFoundException("Currency not found");

    const patch: Partial<CurrencyRow> = {};
    if (dto.enabled !== undefined) patch.enabled = dto.enabled;
    if (dto.rounding !== undefined) patch.rounding = String(dto.rounding);
    if (dto.rate !== undefined && code !== "GBP") {
      patch.rate = dto.rate;
      patch.source = "manual";
      patch.rateUpdatedAt = new Date();
    } else if (dto.source !== undefined) {
      patch.source = dto.source;
    }

    const [row] = await this.dbService.db.update(currencies).set(patch).where(eq(currencies.code, code)).returning();
    if (dto.rate !== undefined && code !== "GBP") {
      await this.dbService.db.insert(exchangeRateHistory).values({ code, rate: row.rate, source: "manual" });
    }
    await this.auditLog.record({ adminId, action: "update", entity: "currency", entityId: code, before, after: row });
    return row;
  }

  history(code?: string): Promise<(typeof exchangeRateHistory.$inferSelect)[]> {
    const query = this.dbService.db.select().from(exchangeRateHistory);
    return (code ? query.where(eq(exchangeRateHistory.code, code as CurrencyRow["code"])) : query).orderBy(
      desc(exchangeRateHistory.recordedAt),
    );
  }
}
