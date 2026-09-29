import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { defaultCatalog } from "@cybercina/pricing/defaults";
import type { PricingCatalog, PricingCategory, PricingItem, TimelineOption } from "@cybercina/pricing";
import { count, eq } from "drizzle-orm";
import { AuditLogService } from "../audit/audit-log.service.js";
import { DbService } from "../db/db.service.js";
import {
  pricingCategories,
  pricingItems,
  pricingMultipliers,
  pricingSettings,
  type PricingCategoryRow,
  type PricingItemRow,
  type PricingMultiplierRow,
  type PricingSettingsRow,
} from "../db/schema.js";
import type { CreatePricingItemDto, UpdatePricingItemDto } from "./dto/pricing-item.dto.js";
import type { UpdatePricingCategoryDto } from "./dto/pricing-category.dto.js";
import type { UpdatePricingMultiplierDto } from "./dto/pricing-multiplier.dto.js";
import type { UpdatePricingSettingsDto } from "./dto/pricing-settings.dto.js";

function toPricingItem(row: PricingItemRow): PricingItem {
  return {
    id: row.itemId,
    kind: row.kind,
    categoryId: row.categoryId,
    label: row.label,
    blurb: row.blurb,
    icon: row.icon,
    price: row.price,
    complexity: row.complexity,
    recommends: row.recommends,
    requires: row.requires,
    addons: row.addons,
    active: row.active,
    sort: row.sort,
  };
}

function toPricingCategory(row: PricingCategoryRow): PricingCategory {
  return { id: row.categoryId, label: row.label, icon: row.icon, sort: row.sort };
}

function toMultiplier(row: PricingMultiplierRow): TimelineOption {
  return {
    id: row.multiplierId,
    label: row.label,
    description: row.description,
    multiplier: row.multiplier,
    weeks: row.weeks ?? 0,
    sort: row.sort,
  };
}

@Injectable()
export class PricingService {
  constructor(
    private readonly dbService: DbService,
    private readonly auditLog: AuditLogService,
  ) {}

  /** Seeds the default catalogue on first boot, when pricing_items is empty. */
  async seedIfEmpty(): Promise<void> {
    const db = this.dbService.db;
    const [{ value: itemCount }] = await db.select({ value: count() }).from(pricingItems);
    if (itemCount > 0) return;

    await db.insert(pricingItems).values(
      defaultCatalog.items.map((item) => ({
        itemId: item.id,
        kind: item.kind,
        categoryId: item.categoryId,
        label: item.label,
        blurb: item.blurb,
        icon: item.icon,
        price: item.price,
        complexity: item.complexity,
        recommends: item.recommends,
        requires: item.requires,
        addons: item.addons,
        active: item.active,
        sort: item.sort,
      })),
    );
    await db.insert(pricingCategories).values(
      defaultCatalog.categories.map((category) => ({
        categoryId: category.id,
        label: category.label,
        icon: category.icon,
        sort: category.sort,
      })),
    );
    await db.insert(pricingMultipliers).values([
      ...defaultCatalog.complexity.map((m) => ({ group: "complexity" as const, multiplierId: m.id, label: m.label, description: m.description, multiplier: m.multiplier, weeks: null, sort: m.sort })),
      ...defaultCatalog.timelines.map((m) => ({ group: "timeline" as const, multiplierId: m.id, label: m.label, description: m.description, multiplier: m.multiplier, weeks: m.weeks, sort: m.sort })),
      ...defaultCatalog.scale.map((m) => ({ group: "scale" as const, multiplierId: m.id, label: m.label, description: m.description, multiplier: m.multiplier, weeks: null, sort: m.sort })),
    ]);
    await db.insert(pricingSettings).values({
      additionalSolutionFactor: defaultCatalog.settings.additionalSolutionFactor,
      rangeLow: defaultCatalog.settings.rangeLow,
      rangeHigh: defaultCatalog.settings.rangeHigh,
      roundTo: defaultCatalog.settings.roundTo,
    });
  }

  async getCatalog(): Promise<PricingCatalog> {
    const db = this.dbService.db;
    const [items, categories, multipliers, settingsRow] = await Promise.all([
      db.select().from(pricingItems),
      db.select().from(pricingCategories),
      db.select().from(pricingMultipliers),
      this.getSettingsRow(),
    ]);

    const version = [
      ...items.map((i) => i.updatedAt),
      ...categories.map((c) => c.updatedAt),
      ...multipliers.map((m) => m.updatedAt),
      settingsRow.updatedAt,
    ].reduce((latest, date) => (date > latest ? date : latest), new Date(0));

    return {
      version: version.toISOString(),
      items: items.map(toPricingItem).sort((a, b) => a.sort - b.sort),
      categories: categories.map(toPricingCategory).sort((a, b) => a.sort - b.sort),
      complexity: multipliers.filter((m) => m.group === "complexity").map(toMultiplier).sort((a, b) => a.sort - b.sort),
      timelines: multipliers.filter((m) => m.group === "timeline").map(toMultiplier).sort((a, b) => a.sort - b.sort),
      scale: multipliers.filter((m) => m.group === "scale").map(toMultiplier).sort((a, b) => a.sort - b.sort),
      settings: {
        additionalSolutionFactor: settingsRow.additionalSolutionFactor,
        rangeLow: settingsRow.rangeLow,
        rangeHigh: settingsRow.rangeHigh,
        roundTo: settingsRow.roundTo,
      },
    };
  }

  private async getSettingsRow(): Promise<PricingSettingsRow> {
    const [row] = await this.dbService.db.select().from(pricingSettings).limit(1);
    if (!row) throw new NotFoundException("Pricing settings not configured");
    return row;
  }

  /** Every row, active or not — the admin catalogue editor needs the inactive ones too. */
  listItems(): Promise<PricingItemRow[]> {
    return this.dbService.db.select().from(pricingItems).orderBy(pricingItems.sort);
  }

  listCategories(): Promise<PricingCategoryRow[]> {
    return this.dbService.db.select().from(pricingCategories).orderBy(pricingCategories.sort);
  }

  listMultipliers(): Promise<PricingMultiplierRow[]> {
    return this.dbService.db.select().from(pricingMultipliers).orderBy(pricingMultipliers.sort);
  }

  async getItem(id: string): Promise<PricingItemRow> {
    const [row] = await this.dbService.db.select().from(pricingItems).where(eq(pricingItems.id, id)).limit(1);
    if (!row) throw new NotFoundException("Pricing item not found");
    return row;
  }

  async createItem(dto: CreatePricingItemDto, adminId: string): Promise<PricingItemRow> {
    const [existing] = await this.dbService.db.select().from(pricingItems).where(eq(pricingItems.itemId, dto.id)).limit(1);
    if (existing) throw new ConflictException(`Pricing item "${dto.id}" already exists`);

    // `dto.id` is the catalogue id (e.g. "custom-widget"); the table's own `id`
    // column is a generated uuid, so it must never be overwritten by the spread.
    const { id: itemId, ...values } = dto;
    const [row] = await this.dbService.db
      .insert(pricingItems)
      .values({ ...values, itemId })
      .returning();
    await this.auditLog.record({ adminId, action: "create", entity: "pricing_item", entityId: row.id, before: null, after: row });
    return row;
  }

  async updateItem(id: string, dto: UpdatePricingItemDto, adminId: string): Promise<PricingItemRow> {
    const before = await this.getItem(id);
    const [row] = await this.dbService.db
      .update(pricingItems)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(pricingItems.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "update", entity: "pricing_item", entityId: id, before, after: row });
    return row;
  }

  async getCategory(id: string): Promise<PricingCategoryRow> {
    const [row] = await this.dbService.db.select().from(pricingCategories).where(eq(pricingCategories.id, id)).limit(1);
    if (!row) throw new NotFoundException("Pricing category not found");
    return row;
  }

  async updateCategory(id: string, dto: UpdatePricingCategoryDto, adminId: string): Promise<PricingCategoryRow> {
    const before = await this.getCategory(id);
    const [row] = await this.dbService.db
      .update(pricingCategories)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(pricingCategories.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "update", entity: "pricing_category", entityId: id, before, after: row });
    return row;
  }

  async getMultiplier(id: string): Promise<PricingMultiplierRow> {
    const [row] = await this.dbService.db.select().from(pricingMultipliers).where(eq(pricingMultipliers.id, id)).limit(1);
    if (!row) throw new NotFoundException("Pricing multiplier not found");
    return row;
  }

  async updateMultiplier(id: string, dto: UpdatePricingMultiplierDto, adminId: string): Promise<PricingMultiplierRow> {
    const before = await this.getMultiplier(id);
    const [row] = await this.dbService.db
      .update(pricingMultipliers)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(pricingMultipliers.id, id))
      .returning();
    await this.auditLog.record({ adminId, action: "update", entity: "pricing_multiplier", entityId: id, before, after: row });
    return row;
  }

  async getSettings(): Promise<PricingSettingsRow> {
    return this.getSettingsRow();
  }

  async updateSettings(dto: UpdatePricingSettingsDto, adminId: string): Promise<PricingSettingsRow> {
    const before = await this.getSettingsRow();
    const [row] = await this.dbService.db
      .update(pricingSettings)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(pricingSettings.id, before.id))
      .returning();
    await this.auditLog.record({ adminId, action: "update", entity: "pricing_settings", entityId: row.id, before, after: row });
    return row;
  }
}
