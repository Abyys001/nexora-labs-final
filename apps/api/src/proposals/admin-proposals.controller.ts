import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, Res, UseGuards } from "@nestjs/common";
import type { Response } from "express";
import { CurrentAdmin } from "../auth/current-admin.decorator.js";
import type { JwtPayload } from "../auth/jwt-payload.type.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { ProposalRow } from "../db/schema.js";
import { PdfService } from "../pdf/pdf.service.js";
import { CreateProposalDto, createProposalSchema, UpdateProposalDto, updateProposalSchema } from "./dto/proposal-content.dto.js";
import { SetFinalPriceDto, setFinalPriceSchema } from "./dto/set-final-price.dto.js";
import { ProposalsService } from "./proposals.service.js";

const IdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException("Not found") });

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProposalsController {
  constructor(
    private readonly proposalsService: ProposalsService,
    private readonly pdfService: PdfService,
  ) {}

  @Post("admin/enquiries/:id/final-price")
  @Roles("manager")
  setFinalPrice(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(setFinalPriceSchema)) body: SetFinalPriceDto,
    @CurrentAdmin() admin: JwtPayload,
  ) {
    return this.proposalsService.setFinalPrice(id, body, admin.sub);
  }

  @Post("admin/enquiries/:id/proposals")
  @Roles("manager")
  createDraft(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(createProposalSchema)) body: CreateProposalDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<ProposalRow> {
    return this.proposalsService.createDraft(id, body, admin.sub);
  }

  @Get("admin/proposals")
  @Roles("viewer")
  list(): Promise<ProposalRow[]> {
    return this.proposalsService.list();
  }

  @Get("admin/proposals/:id")
  @Roles("viewer")
  getOne(@Param("id", IdPipe) id: string): Promise<ProposalRow> {
    return this.proposalsService.getById(id);
  }

  @Patch("admin/proposals/:id")
  @Roles("manager")
  update(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(updateProposalSchema)) body: UpdateProposalDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<ProposalRow> {
    return this.proposalsService.update(id, body, admin.sub);
  }

  @Post("admin/proposals/:id/publish")
  @Roles("manager")
  publish(@Param("id", IdPipe) id: string, @CurrentAdmin() admin: JwtPayload): Promise<ProposalRow> {
    return this.proposalsService.publish(id, admin.sub);
  }

  @Post("admin/proposals/:id/withdraw")
  @Roles("manager")
  withdraw(@Param("id", IdPipe) id: string, @CurrentAdmin() admin: JwtPayload): Promise<ProposalRow> {
    return this.proposalsService.withdraw(id, admin.sub);
  }

  @Get("admin/proposals/:id/pdf")
  @Roles("viewer")
  async pdf(@Param("id", IdPipe) id: string, @Res() res: Response): Promise<void> {
    const data = await this.proposalsService.pdfDataForProposal(id);
    const buffer = await this.pdfService.renderProposal(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${data.reference}-proposal.pdf"`);
    res.send(buffer);
  }
}
