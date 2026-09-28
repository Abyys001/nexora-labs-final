import { z } from "zod";

export const enquiryStatusValues = [
  "new",
  "contacted",
  "qualified",
  "won",
  "lost",
  "archived",
] as const;

export const updateEnquirySchema = z.object({
  status: z.enum(enquiryStatusValues).optional(),
  notes: z.string().max(5000).optional(),
});

export type UpdateEnquiryDto = z.infer<typeof updateEnquirySchema>;
