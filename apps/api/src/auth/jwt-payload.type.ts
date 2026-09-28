import type { AdminRole } from "../db/schema.js";

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: AdminRole;
}
