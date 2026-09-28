import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { AdminProfile, AuthService, LoginResult } from "./auth.service.js";
import { CurrentAdmin } from "./current-admin.decorator.js";
import { LoginDto, loginSchema } from "./dto/login.dto.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import type { JwtPayload } from "./jwt-payload.type.js";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginDto): Promise<LoginResult> {
    return this.authService.login(body.email, body.password);
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@CurrentAdmin() admin: JwtPayload): Promise<AdminProfile> {
    return this.authService.findById(admin.sub);
  }
}
