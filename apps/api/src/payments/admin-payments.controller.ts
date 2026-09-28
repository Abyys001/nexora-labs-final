import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, UseGuards } from "@nestjs/common";
import { CurrentAdmin } from "../auth/current-admin.decorator.js";
import type { JwtPayload } from "../auth/jwt-payload.type.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { PaymentPlanRow, PaymentRow } from "../db/schema.js";
import { RecordPaymentDto, recordPaymentSchema } from "./dto/record-payment.dto.js";
import { ReasonDto, reasonSchema } from "./dto/reason.dto.js";
import { AdminPaymentSummary, PaymentsService } from "./payments.service.js";

const IdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException("Not found") });

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get("admin/payments")
  @Roles("viewer")
  list(): Promise<AdminPaymentSummary[]> {
    return this.paymentsService.adminList();
  }

  @Post("admin/payments")
  @Roles("manager")
  record(
    @Body(new ZodValidationPipe(recordPaymentSchema)) body: RecordPaymentDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PaymentRow> {
    return this.paymentsService.recordPayment(body, admin.sub);
  }

  @Post("admin/payments/:id/refund")
  @Roles("manager")
  refund(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(reasonSchema)) body: ReasonDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PaymentRow> {
    return this.paymentsService.refund(id, admin.sub, body.reason);
  }

  @Post("admin/payment-plans/:id/cancel")
  @Roles("manager")
  cancelPlan(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(reasonSchema)) body: ReasonDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PaymentPlanRow> {
    return this.paymentsService.cancelPlan(id, admin.sub, body.reason);
  }
}
