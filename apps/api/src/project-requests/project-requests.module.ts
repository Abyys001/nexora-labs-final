import { Module } from "@nestjs/common";
import { CurrenciesModule } from "../currencies/currencies.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";
import { PaymentsModule } from "../payments/payments.module.js";
import { PdfModule } from "../pdf/pdf.module.js";
import { PricingModule } from "../pricing/pricing.module.js";
import { ProposalsModule } from "../proposals/proposals.module.js";
import { ProjectRequestsController } from "./project-requests.controller.js";
import { ProjectRequestsService } from "./project-requests.service.js";

@Module({
  imports: [PricingModule, CurrenciesModule, NotificationsModule, ProposalsModule, PaymentsModule, PdfModule],
  controllers: [ProjectRequestsController],
  providers: [ProjectRequestsService],
  exports: [ProjectRequestsService],
})
export class ProjectRequestsModule {}
