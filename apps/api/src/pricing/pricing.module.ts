import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { CurrenciesModule } from "../currencies/currencies.module.js";
import { AdminPricingController } from "./admin-pricing.controller.js";
import { PricingController } from "./pricing.controller.js";
import { PricingService } from "./pricing.service.js";

@Module({
  imports: [AuthModule, CurrenciesModule],
  controllers: [PricingController, AdminPricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
