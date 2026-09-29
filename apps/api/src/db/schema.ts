import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";
import type { ConfigurationDto } from "../enquiries/dto/create-enquiry.dto.js";
import type { Estimate, Selection } from "@cybercina/pricing";

export const enquirySourceEnum = pgEnum("enquiry_source", ["contact", "quote"]);

export const projectTypeEnum = pgEnum("project_type", [
  "website",
  "web-app",
  "mobile-app",
  "ai",
  "crm",
  "saas",
  "automation",
  "ecommerce",
  "other",
]);

export const budgetEnum = pgEnum("budget", [
  "2k-5k",
  "5k-10k",
  "10k-25k",
  "25k-50k",
  "50k-plus",
  "not-sure",
]);

export const preferredContactEnum = pgEnum("preferred_contact", ["email", "phone", "video-call"]);

export const companySizeEnum = pgEnum("company_size", [
  "1-10",
  "11-50",
  "51-200",
  "201-1000",
  "1000-plus",
]);

export const timelineEnum = pgEnum("timeline", [
  "asap",
  "1-3-months",
  "3-6-months",
  "6-plus-months",
  "flexible",
]);

export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
  "archived",
]);

export const adminRoleEnum = pgEnum("admin_role", ["owner", "manager", "viewer"]);
export type AdminRole = (typeof adminRoleEnum.enumValues)[number];

export const admins = pgTable("admins", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: adminRoleEnum("role").notNull().default("viewer"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// --- Commercial flow (docs/architecture/commercial-flow.md) ---

export const pricingItemKindEnum = pgEnum("pricing_item_kind", [
  "solution",
  "feature",
  "platform",
  "integration",
  "ai",
  "design",
  "support",
  "maintenance",
]);

export const itemComplexityEnum = pgEnum("item_complexity", ["s", "m", "l", "xl"]);
export const multiplierGroupEnum = pgEnum("multiplier_group", ["complexity", "timeline", "scale"]);
export const currencyCodeEnum = pgEnum("currency_code", ["GBP", "EUR", "USD"]);
export const currencySourceEnum = pgEnum("currency_source", ["provider", "manual"]);
export const proposalStatusEnum = pgEnum("proposal_status", ["draft", "published", "accepted", "superseded", "withdrawn"]);
export const paymentPlanKindEnum = pgEnum("payment_plan_kind", ["full", "split-completion", "split-development"]);
export const scheduleStatusEnum = pgEnum("schedule_status", [
  "scheduled",
  "awaiting",
  "paid",
  "partially-paid",
  "overdue",
  "cancelled",
  "refunded",
]);
export const paymentMethodEnum = pgEnum("payment_method", ["bank-transfer", "stripe", "other"]);
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "succeeded", "failed", "refunded"]);
export const priceChangeModeEnum = pgEnum("price_change_mode", ["accept", "adjust", "manual"]);

export const pricingItems = pgTable("pricing_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  itemId: text("item_id").notNull().unique(),
  kind: pricingItemKindEnum("kind").notNull(),
  categoryId: text("category_id").notNull(),
  label: text("label").notNull(),
  blurb: text("blurb").notNull().default(""),
  icon: text("icon").notNull(),
  price: integer("price").notNull(),
  complexity: itemComplexityEnum("complexity").notNull(),
  recommends: text("recommends").array().notNull().default(sql`'{}'::text[]`),
  requires: text("requires").array().notNull().default(sql`'{}'::text[]`),
  addons: text("addons").array().notNull().default(sql`'{}'::text[]`),
  active: boolean("active").notNull().default(true),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pricingCategories = pgTable("pricing_categories", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  categoryId: text("category_id").notNull().unique(),
  label: text("label").notNull(),
  icon: text("icon").notNull(),
  sort: integer("sort").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const pricingMultipliers = pgTable(
  "pricing_multipliers",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),
    group: multiplierGroupEnum("group").notNull(),
    multiplierId: text("multiplier_id").notNull(),
    label: text("label").notNull(),
    description: text("description").notNull().default(""),
    multiplier: numeric("multiplier", { precision: 6, scale: 4, mode: "number" }).notNull(),
    weeks: integer("weeks"),
    sort: integer("sort").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("pricing_multipliers_group_id_unique").on(table.group, table.multiplierId)],
);

export const pricingSettings = pgTable("pricing_settings", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  additionalSolutionFactor: numeric("additional_solution_factor", { precision: 4, scale: 3, mode: "number" }).notNull(),
  rangeLow: numeric("range_low", { precision: 4, scale: 3, mode: "number" }).notNull(),
  rangeHigh: numeric("range_high", { precision: 4, scale: 3, mode: "number" }).notNull(),
  roundTo: integer("round_to").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const currencies = pgTable("currencies", {
  code: currencyCodeEnum("code").primaryKey(),
  enabled: boolean("enabled").notNull().default(false),
  rate: numeric("rate", { precision: 12, scale: 6, mode: "number" }).notNull().default(1),
  source: currencySourceEnum("source").notNull().default("manual"),
  rounding: text("rounding").notNull().default("none"),
  rateUpdatedAt: timestamp("rate_updated_at", { withTimezone: true }),
  lastRefreshError: text("last_refresh_error"),
});

export const exchangeRateHistory = pgTable("exchange_rate_history", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  code: currencyCodeEnum("code").notNull(),
  rate: numeric("rate", { precision: 12, scale: 6, mode: "number" }).notNull(),
  source: currencySourceEnum("source").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const enquiries = pgTable("enquiries", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  source: enquirySourceEnum("source").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  phone: text("phone"),
  projectType: projectTypeEnum("project_type").notNull(),
  budget: budgetEnum("budget").notNull(),
  description: text("description").notNull(),
  preferredContact: preferredContactEnum("preferred_contact").notNull().default("email"),
  industry: text("industry"),
  companySize: companySizeEnum("company_size"),
  website: text("website"),
  features: text("features").array(),
  timeline: timelineEnum("timeline"),
  startDate: text("start_date"),
  configuration: jsonb("configuration").$type<ConfigurationDto>(),
  status: enquiryStatusEnum("status").notNull().default("new"),
  notes: text("notes"),
  ipHash: text("ip_hash"),
  userAgent: text("user_agent"),
  // Project Builder commercial flow — null for plain contact-form enquiries.
  reference: text("reference").unique(),
  accessTokenHash: text("access_token_hash").unique(),
  selection: jsonb("selection").$type<Selection>(),
  estimate: jsonb("estimate").$type<Estimate>(),
  estimateGbp: integer("estimate_gbp"),
  currency: currencyCodeEnum("currency"),
  exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6, mode: "number" }),
  rateRecordedAt: timestamp("rate_recorded_at", { withTimezone: true }),
  finalPriceGbp: integer("final_price_gbp"),
  projectDetails: jsonb("project_details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const priceChanges = pgTable("price_changes", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  enquiryId: uuid("enquiry_id")
    .notNull()
    .references(() => enquiries.id),
  adminId: uuid("admin_id").references(() => admins.id),
  previousGbp: integer("previous_gbp"),
  newGbp: integer("new_gbp").notNull(),
  mode: priceChangeModeEnum("mode").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const proposals = pgTable("proposals", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  enquiryId: uuid("enquiry_id")
    .notNull()
    .references(() => enquiries.id),
  version: integer("version").notNull(),
  status: proposalStatusEnum("status").notNull().default("draft"),
  automatedEstimateGbp: integer("automated_estimate_gbp").notNull(),
  finalPriceGbp: integer("final_price_gbp").notNull(),
  currency: currencyCodeEnum("currency").notNull().default("GBP"),
  exchangeRate: numeric("exchange_rate", { precision: 12, scale: 6, mode: "number" }),
  rateRecordedAt: timestamp("rate_recorded_at", { withTimezone: true }),
  amountInCurrency: numeric("amount_in_currency", { precision: 14, scale: 2, mode: "number" }),
  content: jsonb("content").$type<ProposalContent>().notNull(),
  validUntil: date("valid_until"),
  createdBy: uuid("created_by").references(() => admins.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentPlans = pgTable("payment_plans", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  proposalId: uuid("proposal_id")
    .notNull()
    .unique()
    .references(() => proposals.id),
  plan: paymentPlanKindEnum("plan").notNull(),
  secondDueDate: date("second_due_date"),
  cancelled: boolean("cancelled").notNull().default(false),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const paymentScheduleItems = pgTable("payment_schedule_items", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  planId: uuid("plan_id")
    .notNull()
    .references(() => paymentPlans.id),
  sequence: integer("sequence").notNull(),
  label: text("label").notNull(),
  amountGbp: integer("amount_gbp").notNull(),
  amountInCurrency: numeric("amount_in_currency", { precision: 14, scale: 2, mode: "number" }),
  dueDate: date("due_date").notNull(),
  status: scheduleStatusEnum("status").notNull().default("scheduled"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const payments = pgTable("payments", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  scheduleItemId: uuid("schedule_item_id")
    .notNull()
    .references(() => paymentScheduleItems.id),
  amountGbp: integer("amount_gbp").notNull(),
  amountInCurrency: numeric("amount_in_currency", { precision: 14, scale: 2, mode: "number" }),
  currency: currencyCodeEnum("currency").notNull().default("GBP"),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("pending"),
  providerRef: text("provider_ref").unique(),
  recordedBy: uuid("recorded_by").references(() => admins.id),
  note: text("note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projectStatusEnum = pgEnum("project_status", ["draft", "published", "archived"]);

/** Portfolio entries — real client work shown on /work. Managed entirely from the admin panel. */
export const projects = pgTable("projects", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  client: text("client").notNull(),
  industry: text("industry").notNull(),
  category: text("category").notNull(),
  shortDescription: text("short_description").notNull(),
  detailedDescription: text("detailed_description").notNull().default(""),
  clientNeed: text("client_need").notNull().default(""),
  whatWeBuilt: text("what_we_built").notNull().default(""),
  customerExperience: text("customer_experience").notNull().default(""),
  businessFunctionality: text("business_functionality").notNull().default(""),
  services: text("services").array().notNull().default(sql`'{}'::text[]`),
  capabilities: text("capabilities").array().notNull().default(sql`'{}'::text[]`),
  technologies: text("technologies").array().notNull().default(sql`'{}'::text[]`),
  websiteUrl: text("website_url"),
  location: text("location"),
  /** Preview palette + layout hint for the generated browser-frame mockup. */
  previewTheme: text("preview_theme").notNull().default("ink"),
  previewLayout: text("preview_layout").notNull().default("standard"),
  heroImage: text("hero_image"),
  previewImage: text("preview_image"),
  gallery: text("gallery").array().notNull().default(sql`'{}'::text[]`),
  featured: boolean("featured").notNull().default(false),
  homepageVisible: boolean("homepage_visible").notNull().default(false),
  status: projectStatusEnum("status").notNull().default("published"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => randomUUID()),
  adminId: uuid("admin_id").references(() => admins.id),
  action: text("action").notNull(),
  entity: text("entity").notNull(),
  entityId: text("entity_id"),
  before: jsonb("before"),
  after: jsonb("after"),
  reason: text("reason"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export interface ProposalContent {
  summary: string;
  requirements: string[];
  scope: { title: string; body: string }[];
  assumptions: string[];
  exclusions: string[];
  nextSteps: string[];
}

export type Admin = typeof admins.$inferSelect;
export type NewAdmin = typeof admins.$inferInsert;
export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
export type PricingItemRow = typeof pricingItems.$inferSelect;
export type NewPricingItemRow = typeof pricingItems.$inferInsert;
export type PricingCategoryRow = typeof pricingCategories.$inferSelect;
export type PricingMultiplierRow = typeof pricingMultipliers.$inferSelect;
export type PricingSettingsRow = typeof pricingSettings.$inferSelect;
export type CurrencyRow = typeof currencies.$inferSelect;
export type ExchangeRateHistoryRow = typeof exchangeRateHistory.$inferSelect;
export type PriceChangeRow = typeof priceChanges.$inferSelect;
export type ProposalRow = typeof proposals.$inferSelect;
export type PaymentPlanRow = typeof paymentPlans.$inferSelect;
export type PaymentScheduleItemRow = typeof paymentScheduleItems.$inferSelect;
export type PaymentRow = typeof payments.$inferSelect;
export type AuditLogRow = typeof auditLogs.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type NewProjectRow = typeof projects.$inferInsert;
