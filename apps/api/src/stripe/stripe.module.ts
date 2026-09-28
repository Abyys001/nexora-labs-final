import { Module } from "@nestjs/common";
import { PaymentsModule } from "../payments/payments.module.js";
import { ProjectRequestsModule } from "../project-requests/project-requests.module.js";
import { StripeController } from "./stripe.controller.js";
import { StripeService } from "./stripe.service.js";

@Module({
  imports: [PaymentsModule, ProjectRequestsModule],
  controllers: [StripeController],
  providers: [StripeService],
})
export class StripeModule {}
