import { roundingSchema } from "@nexora/pricing";
import { z } from "zod";

export const updateCurrencySchema = z.object({
  enabled: z.boolean().optional(),
  rate: z.number().positive().optional(),
  rounding: roundingSchema.optional(),
  source: z.enum(["provider", "manual"]).optional(),
});

export type UpdateCurrencyDto = z.infer<typeof updateCurrencySchema>;
