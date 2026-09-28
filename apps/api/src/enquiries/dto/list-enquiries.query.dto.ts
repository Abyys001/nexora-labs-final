import { z } from "zod";
import { enquiryStatusValues } from "./update-enquiry.dto.js";

export const listEnquiriesQuerySchema = z.object({
  status: z.enum(enquiryStatusValues).optional(),
  source: z.enum(["contact", "quote"]).optional(),
  q: z.string().max(254).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListEnquiriesQueryDto = z.infer<typeof listEnquiriesQuerySchema>;
