import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CurrenciesModule } from "../currencies/currencies.module.js";
import { PricingModule } from "../pricing/pricing.module.js";
import { AdminPaymentsController } from "./admin-payments.controller.js";
import { PaymentsService } from "./payments.service.js";

@Module({
  imports: [AuthModule, CurrenciesModule, PricingModule],
  controllers: [AdminPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
