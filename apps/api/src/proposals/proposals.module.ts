import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CurrenciesModule } from "../currencies/currencies.module.js";
import { PaymentsModule } from "../payments/payments.module.js";
import { PdfModule } from "../pdf/pdf.module.js";
import { PricingModule } from "../pricing/pricing.module.js";
import { AdminProposalsController } from "./admin-proposals.controller.js";
import { ProposalsService } from "./proposals.service.js";

@Module({
  imports: [AuthModule, CurrenciesModule, PricingModule, PaymentsModule, PdfModule],
  controllers: [AdminProposalsController],
  providers: [ProposalsService],
  exports: [ProposalsService],
})
export class ProposalsModule {}
