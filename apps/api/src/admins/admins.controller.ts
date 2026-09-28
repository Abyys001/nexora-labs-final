import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentAdmin } from "../auth/current-admin.decorator.js";
import type { JwtPayload } from "../auth/jwt-payload.type.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { AdminsService, type AdminSummary } from "./admins.service.js";
import { CreateAdminDto, createAdminSchema, UpdateAdminDto, updateAdminSchema } from "./dto/admin.dto.js";

const IdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException("Admin not found") });

@Controller("admin/admins")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("owner")
export class AdminsController {
  constructor(private readonly adminsService: AdminsService) {}

  @Get()
  list(): Promise<AdminSummary[]> {
    return this.adminsService.list();
  }

  @Post()
  create(
    @Body(new ZodValidationPipe(createAdminSchema)) body: CreateAdminDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<AdminSummary> {
    return this.adminsService.create(body, admin.sub);
  }

  @Patch(":id")
  update(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(updateAdminSchema)) body: UpdateAdminDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<AdminSummary> {
    return this.adminsService.update(id, body, admin.sub);
  }
}
