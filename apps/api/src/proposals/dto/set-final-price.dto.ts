import { z } from "zod";

export const setFinalPriceSchema = z
  .object({
    mode: z.enum(["accept", "adjust", "manual"]),
    amountGbp: z.number().int().positive().optional(),
    deltaGbp: z.number().int().optional(),
    reason: z.string().trim().min(1).max(2000),
  })
  .refine((v) => v.mode !== "manual" || v.amountGbp !== undefined, { message: "amountGbp is required for mode=manual", path: ["amountGbp"] })
  .refine((v) => v.mode !== "adjust" || v.deltaGbp !== undefined, { message: "deltaGbp is required for mode=adjust", path: ["deltaGbp"] });

export type SetFinalPriceDto = z.infer<typeof setFinalPriceSchema>;
