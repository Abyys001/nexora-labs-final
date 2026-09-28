import { complexitySchema, itemKindSchema } from "@nexora/pricing";
import { z } from "zod";

const idField = z.string().trim().min(1).max(80);

export const createPricingItemSchema = z.object({
  id: idField,
  kind: itemKindSchema,
  categoryId: idField,
  label: z.string().trim().min(1).max(160),
  blurb: z.string().trim().max(500).default(""),
  icon: z.string().trim().min(1).max(80),
  price: z.number().int().nonnegative(),
  complexity: complexitySchema,
  recommends: z.array(idField).default([]),
  requires: z.array(idField).default([]),
  addons: z.array(idField).default([]),
  active: z.boolean().default(true),
  sort: z.number().int().default(0),
});

export type CreatePricingItemDto = z.infer<typeof createPricingItemSchema>;

export const updatePricingItemSchema = createPricingItemSchema.omit({ id: true }).partial();

export type UpdatePricingItemDto = z.infer<typeof updatePricingItemSchema>;
