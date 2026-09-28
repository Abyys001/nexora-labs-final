import { Controller, Get, Header } from "@nestjs/common";
import type { PricingCatalog } from "@nexora/pricing";
import { CurrenciesService, type PublicCurrency } from "../currencies/currencies.service.js";
import { PricingService } from "./pricing.service.js";

export interface PublicPricingResponse {
  catalog: PricingCatalog;
  currencies: PublicCurrency[];
}

@Controller("public/pricing")
export class PricingController {
  constructor(
    private readonly pricingService: PricingService,
    private readonly currenciesService: CurrenciesService,
  ) {}

  @Get()
  @Header("Cache-Control", "public, max-age=60")
  async get(): Promise<PublicPricingResponse> {
    const [catalog, currencies] = await Promise.all([this.pricingService.getCatalog(), this.currenciesService.listPublic()]);
    return { catalog, currencies };
  }
}
