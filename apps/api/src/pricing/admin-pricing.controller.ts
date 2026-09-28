import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Post, Put, UseGuards } from "@nestjs/common";
import { CurrentAdmin } from "../auth/current-admin.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { JwtPayload } from "../auth/jwt-payload.type.js";
import type { PricingCategoryRow, PricingItemRow, PricingMultiplierRow, PricingSettingsRow } from "../db/schema.js";
import { CreatePricingItemDto, createPricingItemSchema, UpdatePricingItemDto, updatePricingItemSchema } from "./dto/pricing-item.dto.js";
import { UpdatePricingCategoryDto, updatePricingCategorySchema } from "./dto/pricing-category.dto.js";
import { UpdatePricingMultiplierDto, updatePricingMultiplierSchema } from "./dto/pricing-multiplier.dto.js";
import { UpdatePricingSettingsDto, updatePricingSettingsSchema } from "./dto/pricing-settings.dto.js";
import { PricingService } from "./pricing.service.js";

const IdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException("Not found") });

@Controller("admin/pricing")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminPricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get("items")
  @Roles("viewer")
  listItems(): Promise<PricingItemRow[]> {
    return this.pricingService.listItems();
  }

  @Get("categories")
  @Roles("viewer")
  listCategories(): Promise<PricingCategoryRow[]> {
    return this.pricingService.listCategories();
  }

  @Get("multipliers")
  @Roles("viewer")
  listMultipliers(): Promise<PricingMultiplierRow[]> {
    return this.pricingService.listMultipliers();
  }

  @Get("items/:id")
  @Roles("viewer")
  getItem(@Param("id", IdPipe) id: string): Promise<PricingItemRow> {
    return this.pricingService.getItem(id);
  }

  @Post("items")
  @Roles("manager")
  createItem(
    @Body(new ZodValidationPipe(createPricingItemSchema)) body: CreatePricingItemDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PricingItemRow> {
    return this.pricingService.createItem(body, admin.sub);
  }

  @Put("items/:id")
  @Roles("manager")
  updateItem(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(updatePricingItemSchema)) body: UpdatePricingItemDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PricingItemRow> {
    return this.pricingService.updateItem(id, body, admin.sub);
  }

  @Get("categories/:id")
  @Roles("viewer")
  getCategory(@Param("id", IdPipe) id: string): Promise<PricingCategoryRow> {
    return this.pricingService.getCategory(id);
  }

  @Put("categories/:id")
  @Roles("manager")
  updateCategory(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(updatePricingCategorySchema)) body: UpdatePricingCategoryDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PricingCategoryRow> {
    return this.pricingService.updateCategory(id, body, admin.sub);
  }

  @Get("multipliers/:id")
  @Roles("viewer")
  getMultiplier(@Param("id", IdPipe) id: string): Promise<PricingMultiplierRow> {
    return this.pricingService.getMultiplier(id);
  }

  @Put("multipliers/:id")
  @Roles("manager")
  updateMultiplier(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(updatePricingMultiplierSchema)) body: UpdatePricingMultiplierDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PricingMultiplierRow> {
    return this.pricingService.updateMultiplier(id, body, admin.sub);
  }

  @Get("settings")
  @Roles("viewer")
  getSettings(): Promise<PricingSettingsRow> {
    return this.pricingService.getSettings();
  }

  @Put("settings")
  @Roles("manager")
  updateSettings(
    @Body(new ZodValidationPipe(updatePricingSettingsSchema)) body: UpdatePricingSettingsDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<PricingSettingsRow> {
    return this.pricingService.updateSettings(body, admin.sub);
  }
}
