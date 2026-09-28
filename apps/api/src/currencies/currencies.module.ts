import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { AdminCurrenciesController } from "./admin-currencies.controller.js";
import { CurrenciesService } from "./currencies.service.js";

@Module({
  imports: [AuthModule],
  controllers: [AdminCurrenciesController],
  providers: [CurrenciesService],
  exports: [CurrenciesService],
})
export class CurrenciesModule {}
