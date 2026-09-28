import { z } from "zod";

export const updatePricingCategorySchema = z.object({
  label: z.string().trim().min(1).max(160).optional(),
  icon: z.string().trim().min(1).max(80).optional(),
  sort: z.number().int().optional(),
});

export type UpdatePricingCategoryDto = z.infer<typeof updatePricingCategorySchema>;
