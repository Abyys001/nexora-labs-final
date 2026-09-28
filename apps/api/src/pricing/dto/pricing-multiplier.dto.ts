import { z } from "zod";

export const updatePricingMultiplierSchema = z.object({
  label: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(500).optional(),
  multiplier: z.number().positive().optional(),
  weeks: z.number().int().positive().nullable().optional(),
  sort: z.number().int().optional(),
});

export type UpdatePricingMultiplierDto = z.infer<typeof updatePricingMultiplierSchema>;
