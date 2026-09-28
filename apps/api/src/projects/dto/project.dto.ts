import { z } from "zod";

const slugField = z
  .string()
  .trim()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase words separated by hyphens");

const textList = (max: number, itemMax = 120) => z.array(z.string().trim().min(1).max(itemMax)).max(max);

export const createProjectSchema = z.object({
  slug: slugField,
  title: z.string().trim().min(1).max(160),
  client: z.string().trim().min(1).max(160),
  industry: z.string().trim().min(1).max(120),
  category: z.string().trim().min(1).max(120),
  location: z.string().trim().max(160).optional(),
  websiteUrl: z.string().url().max(400).optional(),
  shortDescription: z.string().trim().min(1).max(400),
  detailedDescription: z.string().trim().max(4000).default(""),
  clientNeed: z.string().trim().max(2000).default(""),
  whatWeBuilt: z.string().trim().max(2000).default(""),
  customerExperience: z.string().trim().max(2000).default(""),
  businessFunctionality: z.string().trim().max(2000).default(""),
  services: textList(20, 80).default([]),
  capabilities: textList(30).default([]),
  technologies: textList(20).default([]),
  previewTheme: z.enum(["ink", "amber", "azure", "violet", "steel"]).default("ink"),
  previewLayout: z.enum(["standard", "hospitality", "commerce", "services", "booking"]).default("standard"),
  heroImage: z.string().url().max(500).optional(),
  previewImage: z.string().url().max(500).optional(),
  gallery: z.array(z.string().url().max(500)).max(12).default([]),
  featured: z.boolean().default(false),
  homepageVisible: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("published"),
  sortOrder: z.number().int().default(0),
});

export type CreateProjectDto = z.infer<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();

export type UpdateProjectDto = z.infer<typeof updateProjectSchema>;
