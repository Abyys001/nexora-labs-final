import { z } from "zod";

// Compose/shell commonly pass unset optional vars through as "" (e.g. `${ADMIN_EMAIL:-}`)
// rather than omitting them, so treat blank strings the same as "not set".
function optionalString<T extends z.ZodType<string>>(schema: T) {
  return z.preprocess((val) => (val === "" ? undefined : val), schema.optional());
}

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN_SECONDS: z.coerce.number().int().positive().default(28800),
  IP_HASH_SALT: z.string().min(1, "IP_HASH_SALT is required"),
  ADMIN_EMAIL: optionalString(z.string().email()),
  ADMIN_PASSWORD: optionalString(z.string().min(1)),
  ADMIN_NAME: optionalString(z.string().min(1)),
  SMTP_URL: optionalString(z.string().min(1)),
  NOTIFY_EMAIL_TO: optionalString(z.string().email()),
  MAIL_FROM: optionalString(z.string().min(1)),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1, "CORS_ORIGIN is required"),
  FX_PROVIDER_URL: optionalString(z.string().url()),
  FX_REFRESH_HOURS: z.coerce.number().int().positive().default(12),
  STRIPE_SECRET_KEY: optionalString(z.string().min(1)),
  STRIPE_WEBHOOK_SECRET: optionalString(z.string().min(1)),
  PAYMENT_BANK_DETAILS: optionalString(z.string().min(1)),
  PUBLIC_SITE_URL: z.string().url("PUBLIC_SITE_URL is required"),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    throw new Error(`Invalid environment configuration:\n${issues.join("\n")}`);
  }
  return result.data;
}
