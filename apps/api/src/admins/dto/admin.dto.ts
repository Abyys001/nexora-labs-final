import { z } from "zod";

export const adminRoleValues = ["owner", "manager", "viewer"] as const;

export const createAdminSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().trim().min(1).max(160),
  role: z.enum(adminRoleValues),
  password: z.string().min(8).max(200),
});

export type CreateAdminDto = z.infer<typeof createAdminSchema>;

export const updateAdminSchema = z.object({
  role: z.enum(adminRoleValues).optional(),
  name: z.string().trim().min(1).max(160).optional(),
  password: z.string().min(8).max(200).optional(),
});

export type UpdateAdminDto = z.infer<typeof updateAdminSchema>;
