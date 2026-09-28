import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { DashboardService, type DashboardSummary } from "./dashboard.service.js";

@Controller("admin/dashboard")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("viewer")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  get(): Promise<DashboardSummary> {
    return this.dashboardService.summary();
  }
}
