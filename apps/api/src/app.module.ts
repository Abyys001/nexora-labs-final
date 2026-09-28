import { Module } from "@nestjs/common";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { validateEnv } from "./config/env.schema.js";
import { HttpExceptionFilter } from "./common/http-exception.filter.js";
import { DbModule } from "./db/db.module.js";
import { HealthModule } from "./health/health.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { EnquiriesModule } from "./enquiries/enquiries.module.js";
import { AuditModule } from "./audit/audit.module.js";
import { CurrenciesModule } from "./currencies/currencies.module.js";
import { PricingModule } from "./pricing/pricing.module.js";
import { PaymentsModule } from "./payments/payments.module.js";
import { ProposalsModule } from "./proposals/proposals.module.js";
import { PdfModule } from "./pdf/pdf.module.js";
import { ProjectRequestsModule } from "./project-requests/project-requests.module.js";
import { ProjectsModule } from "./projects/projects.module.js";
import { StripeModule } from "./stripe/stripe.module.js";
import { AdminsModule } from "./admins/admins.module.js";
import { DashboardModule } from "./dashboard/dashboard.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    ThrottlerModule.forRoot([{ name: "default", ttl: 60000, limit: 100 }]),
    DbModule,
    HealthModule,
    AuthModule,
    AuditModule,
    CurrenciesModule,
    PricingModule,
    PaymentsModule,
    PdfModule,
    ProposalsModule,
    ProjectRequestsModule,
    ProjectsModule,
    StripeModule,
    AdminsModule,
    DashboardModule,
    EnquiriesModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}
