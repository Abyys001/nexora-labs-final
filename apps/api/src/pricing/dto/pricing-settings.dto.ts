import { z } from "zod";

export const updatePricingSettingsSchema = z.object({
  additionalSolutionFactor: z.number().nonnegative(),
  rangeLow: z.number().positive(),
  rangeHigh: z.number().positive(),
  roundTo: z.number().int().positive(),
});

export type UpdatePricingSettingsDto = z.infer<typeof updatePricingSettingsSchema>;
