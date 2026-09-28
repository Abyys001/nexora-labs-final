import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { AuditLogService, type AuditLogListResult } from "./audit-log.service.js";
import { ListAuditLogsQueryDto, listAuditLogsQuerySchema } from "./dto/list-audit-logs.query.dto.js";

@Controller("admin/audit-logs")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("manager")
export class AdminAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  list(@Query(new ZodValidationPipe(listAuditLogsQuerySchema)) query: ListAuditLogsQueryDto): Promise<AuditLogListResult> {
    return this.auditLogService.list(query);
  }
}
