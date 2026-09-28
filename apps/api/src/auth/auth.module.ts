import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import type { Env } from "../config/env.schema.js";
import { AdminSeedService } from "./admin-seed.service.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { RolesGuard } from "./roles.guard.js";

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        secret: config.get("JWT_SECRET", { infer: true }),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, AdminSeedService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, AdminSeedService, JwtAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
