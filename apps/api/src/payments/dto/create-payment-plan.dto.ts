import { paymentPlanKindSchema } from "@nexora/pricing";
import { z } from "zod";

export const createPaymentPlanSchema = z.object({
  plan: paymentPlanKindSchema,
  secondDueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "secondDueDate must be YYYY-MM-DD").optional(),
});

export type CreatePaymentPlanDto = z.infer<typeof createPaymentPlanSchema>;
