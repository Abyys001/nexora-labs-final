import { SetMetadata } from "@nestjs/common";
import type { AdminRole } from "../db/schema.js";

export const ROLES_KEY = "roles";

/** Minimum role required to reach the handler (owner > manager > viewer). */
export const Roles = (role: AdminRole) => SetMetadata(ROLES_KEY, role);
