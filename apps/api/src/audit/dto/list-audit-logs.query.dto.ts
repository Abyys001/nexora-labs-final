import { z } from "zod";

export const listAuditLogsQuerySchema = z.object({
  entity: z.string().max(80).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export type ListAuditLogsQueryDto = z.infer<typeof listAuditLogsQuerySchema>;
