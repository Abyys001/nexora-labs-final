import { z } from "zod";

export const itemKindSchema = z.enum([
  "solution",
  "feature",
  "platform",
  "integration",
  "ai",
  "design",
  "support",
  "maintenance",
]);

export const complexitySchema = z.enum(["s", "m", "l", "xl"]);

export const roundingSchema = z.union([z.literal("none"), z.literal(1), z.literal(10), z.literal(50), z.literal(100)]);

export const pricingItemSchema = z.object({
  id: z.string().min(1),
  kind: itemKindSchema,
  categoryId: z.string().min(1),
  label: z.string().min(1),
  blurb: z.string(),
  icon: z.string().min(1),
  price: z.number().nonnegative(),
  complexity: complexitySchema,
  recommends: z.array(z.string()),
  requires: z.array(z.string()),
  addons: z.array(z.string()),
  active: z.boolean(),
  sort: z.number(),
});

export const pricingCategorySchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  icon: z.string().min(1),
  sort: z.number(),
});

export const multiplierSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string(),
  multiplier: z.number().positive(),
  sort: z.number(),
});

export const timelineOptionSchema = multiplierSchema.extend({
  weeks: z.number().positive(),
});

export const pricingSettingsSchema = z.object({
  additionalSolutionFactor: z.number().nonnegative(),
  rangeLow: z.number().positive(),
  rangeHigh: z.number().positive(),
  roundTo: z.number().positive(),
});

export const catalogSchema = z.object({
  version: z.string().min(1),
  items: z.array(pricingItemSchema),
  categories: z.array(pricingCategorySchema),
  complexity: z.array(multiplierSchema),
  timelines: z.array(timelineOptionSchema),
  scale: z.array(multiplierSchema),
  settings: pricingSettingsSchema,
});

export const selectionSchema = z.object({
  solutionTypes: z.array(z.string()).min(1),
  features: z.array(z.string()),
  platforms: z.array(z.string()),
  integrations: z.array(z.string()),
  ai: z.array(z.string()),
  design: z.array(z.string()),
  support: z.string().optional(),
  maintenance: z.string().optional(),
  complexity: z.string().min(1),
  timeline: z.string().min(1),
  userScale: z.string().optional(),
});

export const paymentPlanKindSchema = z.enum(["full", "split-completion", "split-development"]);

export const scheduleStatusSchema = z.enum([
  "scheduled",
  "awaiting",
  "paid",
  "partially-paid",
  "overdue",
  "cancelled",
  "refunded",
]);

export const requestPaymentStatusSchema = z.enum([
  "not-started",
  "awaiting-payment",
  "partially-paid",
  "paid",
  "overdue",
  "cancelled",
  "refunded",
]);
