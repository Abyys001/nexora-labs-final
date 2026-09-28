import "server-only"

import { z } from "zod"

// Shared validation for admin route handlers — mirrors apps/api DTOs (docs/architecture/commercial-flow.md §3).
export const proposalContentSchema = z.object({
  summary: z.string().trim().min(1).max(4000),
  requirements: z.array(z.string().trim().min(1).max(500)).max(100).default([]),
  scope: z.array(z.object({ title: z.string().trim().min(1).max(200), body: z.string().trim().min(1).max(4000) })).max(50).default([]),
  assumptions: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
  exclusions: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
  nextSteps: z.array(z.string().trim().min(1).max(500)).max(50).default([]),
})

export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD")

export const idField = z.string().trim().min(1).max(80)

const projectText = (max: number) => z.string().trim().max(max)

/** Mirrors apps/api/src/projects/dto/project.dto.ts. */
export const projectBodySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens"),
  title: z.string().trim().min(1).max(160),
  client: z.string().trim().min(1).max(160),
  industry: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(120),
  location: projectText(160).optional(),
  websiteUrl: z.url().max(400).optional(),
  shortDescription: z.string().trim().min(1).max(400),
  detailedDescription: projectText(4000).default(""),
  clientNeed: projectText(2000).default(""),
  whatWeBuilt: projectText(2000).default(""),
  customerExperience: projectText(2000).default(""),
  businessFunctionality: projectText(2000).default(""),
  services: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  capabilities: z.array(z.string().trim().min(1).max(120)).max(30).default([]),
  technologies: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  previewTheme: z.enum(["ink", "amber", "azure", "violet", "steel"]).default("ink"),
  previewLayout: z.enum(["standard", "hospitality", "commerce", "services", "booking"]).default("standard"),
  heroImage: z.url().max(500).optional(),
  previewImage: z.url().max(500).optional(),
  gallery: z.array(z.url().max(500)).max(12).default([]),
  featured: z.boolean().default(false),
  homepageVisible: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  sortOrder: z.number().int().default(0),
})
