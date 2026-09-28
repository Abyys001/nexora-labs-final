import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { CurrentAdmin } from "../auth/current-admin.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { CurrencyRow } from "../db/schema.js";
import type { JwtPayload } from "../auth/jwt-payload.type.js";
import { CurrenciesService } from "./currencies.service.js";
import { UpdateCurrencyDto, updateCurrencySchema } from "./dto/update-currency.dto.js";

const currencyCodeSchema = z.enum(["GBP", "EUR", "USD"]);
const historyQuerySchema = z.object({ code: currencyCodeSchema.optional() });

@Controller("admin/currencies")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminCurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @Roles("viewer")
  list(): Promise<CurrencyRow[]> {
    return this.currenciesService.listAll();
  }

  @Get("history")
  @Roles("viewer")
  history(@Query(new ZodValidationPipe(historyQuerySchema)) query: { code?: CurrencyRow["code"] }) {
    return this.currenciesService.history(query.code);
  }

  @Post("refresh")
  @Roles("manager")
  async refresh(): Promise<{ ok: true }> {
    await this.currenciesService.refreshNow();
    return { ok: true };
  }

  @Put(":code")
  @Roles("manager")
  update(
    @Param("code", new ZodValidationPipe(currencyCodeSchema)) code: CurrencyRow["code"],
    @Body(new ZodValidationPipe(updateCurrencySchema)) body: UpdateCurrencyDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<CurrencyRow> {
    return this.currenciesService.update(code, body, admin.sub);
  }
}
