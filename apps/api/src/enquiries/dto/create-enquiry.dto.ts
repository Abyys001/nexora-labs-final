import { z } from "zod";

export const projectTypeValues = [
  "website",
  "web-app",
  "mobile-app",
  "ai",
  "crm",
  "saas",
  "automation",
  "ecommerce",
  "other",
] as const;

export const budgetValues = ["2k-5k", "5k-10k", "10k-25k", "25k-50k", "50k-plus", "not-sure"] as const;

export const companySizeValues = ["1-10", "11-50", "51-200", "201-1000", "1000-plus"] as const;

export const timelineValues = ["asap", "1-3-months", "3-6-months", "6-plus-months", "flexible"] as const;

export const userScaleValues = ["under-100", "100-1k", "1k-10k", "10k-100k", "100k-plus", "not-sure"] as const;
export const projectStageValues = ["idea", "prototype", "live-product", "replacing-system"] as const;

const idList = (max: number) => z.array(z.string().trim().min(1).max(60)).max(max);

// Mirrors apps/web/src/lib/enquiry.ts configurationSchema (Project Builder output).
export const configurationSchema = z.object({
  solutionTypes: idList(15).min(1),
  industries: idList(25),
  goals: idList(20),
  successCriteria: z.string().trim().max(1000).optional(),
  features: idList(120),
  platforms: idList(8),
  userScale: z.enum(userScaleValues).optional(),
  stage: z.enum(projectStageValues).optional(),
  estimate: z
    .object({
      min: z.int().nonnegative().max(10_000_000),
      max: z.int().nonnegative().max(10_000_000),
      currency: z.literal("GBP"),
    })
    .refine((e) => e.max >= e.min, "Estimate max must be at least min"),
});

export type ConfigurationDto = z.infer<typeof configurationSchema>;

export const createEnquirySchema = z.object({
  source: z.enum(["contact", "quote"]),
  name: z.string().min(2).max(120),
  email: z.string().email().max(254),
  company: z.string().max(160).optional(),
  phone: z.string().max(40).optional(),
  projectType: z.enum(projectTypeValues),
  budget: z.enum(budgetValues),
  description: z.string().min(20).max(5000),
  preferredContact: z.enum(["email", "phone", "video-call"]).default("email"),
  industry: z.string().max(80).optional(),
  companySize: z.enum(companySizeValues).optional(),
  website: z.string().url().max(300).optional(),
  features: z.array(z.string().max(80)).max(20).optional(),
  timeline: z.enum(timelineValues).optional(),
  startDate: z.string().max(40).optional(),
  configuration: configurationSchema.optional(),
  hp: z.string().optional(),
});

export type CreateEnquiryDto = z.infer<typeof createEnquirySchema>;
