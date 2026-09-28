import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { eq } from "drizzle-orm";
import type { Env } from "../config/env.schema.js";
import { DbService } from "../db/db.service.js";
import { admins } from "../db/schema.js";
import type { AdminRole } from "../db/schema.js";
import { verifyPassword } from "./password.util.js";

export interface AdminProfile {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export interface LoginResult {
  accessToken: string;
  expiresIn: number;
  admin: AdminProfile;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly dbService: DbService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async login(email: string, password: string): Promise<LoginResult> {
    const [admin] = await this.dbService.db.select().from(admins).where(eq(admins.email, email)).limit(1);
    if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
      throw new UnauthorizedException("Invalid email or password");
    }

    const expiresIn = this.config.get("JWT_EXPIRES_IN_SECONDS", { infer: true });
    const accessToken = await this.jwtService.signAsync(
      { sub: admin.id, email: admin.email, name: admin.name, role: admin.role },
      { expiresIn },
    );

    return {
      accessToken,
      expiresIn,
      admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role },
    };
  }

  async findById(id: string): Promise<AdminProfile> {
    const [admin] = await this.dbService.db.select().from(admins).where(eq(admins.id, id)).limit(1);
    if (!admin) {
      throw new UnauthorizedException("Admin not found");
    }
    return { id: admin.id, email: admin.email, name: admin.name, role: admin.role };
  }
}
