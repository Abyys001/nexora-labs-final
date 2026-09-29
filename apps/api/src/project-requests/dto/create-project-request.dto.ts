import { selectionSchema } from "@cybercina/pricing";
import { z } from "zod";
import { companySizeValues } from "../../enquiries/dto/create-enquiry.dto.js";

export const projectRequestContactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254),
  company: z.string().trim().max(160).optional(),
  phone: z.string().trim().max(40).optional(),
  website: z.string().url().max(300).optional(),
  companySize: z.enum(companySizeValues).optional(),
  preferredContact: z.enum(["email", "phone", "video-call"]).default("email"),
});

export const projectRequestDetailsSchema = z.object({
  goals: z.array(z.string().trim().max(60)).max(20).default([]),
  industries: z.array(z.string().trim().max(60)).max(25).default([]),
  successCriteria: z.string().trim().max(1000).optional(),
  notes: z.string().trim().max(3000).optional(),
  designNotes: z.string().trim().max(2000).optional(),
  startDate: z.string().trim().max(40).optional(),
  paymentPreference: z.string().trim().max(80).optional(),
});

export const createProjectRequestSchema = z.object({
  contact: projectRequestContactSchema,
  selection: selectionSchema,
  details: projectRequestDetailsSchema,
  currency: z.enum(["GBP", "EUR", "USD"]).default("GBP"),
  hp: z.string().optional(),
});

export type CreateProjectRequestDto = z.infer<typeof createProjectRequestSchema>;
