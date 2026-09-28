import { z } from "zod";

export const proposalContentSchema = z.object({
  summary: z.string().trim().min(1).max(4000),
  requirements: z.array(z.string().trim().min(1).max(500)).max(100).default([]),
  scope: z.array(z.object({ title: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(4000) })).max(50).default([]),
  assumptions: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
  exclusions: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
  nextSteps: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
});

export type ProposalContentDto = z.infer<typeof proposalContentSchema>;

export const createProposalSchema = z.object({
  content: proposalContentSchema,
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "validUntil must be YYYY-MM-DD")
    .optional(),
});

export type CreateProposalDto = z.infer<typeof createProposalSchema>;

export const updateProposalSchema = z.object({
  content: proposalContentSchema.optional(),
  validUntil: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "validUntil must be YYYY-MM-DD")
    .optional(),
});

export type UpdateProposalDto = z.infer<typeof updateProposalSchema>;
