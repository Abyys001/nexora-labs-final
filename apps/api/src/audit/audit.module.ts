import { Global, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { AdminAuditLogsController } from "./admin-audit-logs.controller.js";
import { AuditLogService } from "./audit-log.service.js";

@Global()
@Module({
  imports: [AuthModule],
  controllers: [AdminAuditLogsController],
  providers: [AuditLogService],
  exports: [AuditLogService],
})
export class AuditModule {}
