import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module.js";
import { NotificationsModule } from "../notifications/notifications.module.js";
import { PaymentsModule } from "../payments/payments.module.js";
import { ProposalsModule } from "../proposals/proposals.module.js";
import { AdminEnquiriesController } from "./admin-enquiries.controller.js";
import { EnquiriesController } from "./enquiries.controller.js";
import { EnquiriesService } from "./enquiries.service.js";

@Module({
  imports: [AuthModule, NotificationsModule, ProposalsModule, PaymentsModule],
  controllers: [EnquiriesController, AdminEnquiriesController],
  providers: [EnquiriesService],
})
export class EnquiriesModule {}
