import { z } from "zod";

export const recordPaymentSchema = z.object({
  scheduleItemId: z.uuid(),
  amountGbp: z.number().int().positive(),
  method: z.enum(["bank-transfer", "other"]),
  note: z.string().trim().max(2000).optional(),
});

export type RecordPaymentDto = z.infer<typeof recordPaymentSchema>;
