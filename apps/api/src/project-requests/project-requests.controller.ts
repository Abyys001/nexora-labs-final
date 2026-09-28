import { createHash } from "node:crypto";
import { Body, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request, Response } from "express";
import { getClientIp } from "../common/client-ip.util.js";
import type { Env } from "../config/env.schema.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CreatePaymentPlanDto, createPaymentPlanSchema } from "../payments/dto/create-payment-plan.dto.js";
import type { PlanWithSchedule } from "../payments/payments.service.js";
import { PdfService } from "../pdf/pdf.service.js";
import { ProposalsService } from "../proposals/proposals.service.js";
import { CreateProjectRequestDto, createProjectRequestSchema } from "./dto/create-project-request.dto.js";
import { ProjectRequestsService, type PublicRequestView, type SubmitResult } from "./project-requests.service.js";

@Controller()
export class ProjectRequestsController {
  constructor(
    private readonly projectRequestsService: ProjectRequestsService,
    private readonly proposalsService: ProposalsService,
    private readonly pdfService: PdfService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post("project-requests")
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(
    @Body(new ZodValidationPipe(createProjectRequestSchema)) body: CreateProjectRequestDto,
    @Req() req: Request,
  ): Promise<SubmitResult> {
    const ip = getClientIp(req);
    const salt = this.config.get("IP_HASH_SALT", { infer: true });
    const ipHash = ip ? createHash("sha256").update(`${ip}${salt}`).digest("hex") : null;
    const userAgent = (req.headers["user-agent"] as string | undefined) ?? null;
    return this.projectRequestsService.submit(body, { ipHash, userAgent });
  }

  @Get("public/requests/:token")
  getView(@Param("token") token: string): Promise<PublicRequestView> {
    return this.projectRequestsService.getPublicView(token);
  }

  @Post("public/requests/:token/payment-plan")
  createPlan(
    @Param("token") token: string,
    @Body(new ZodValidationPipe(createPaymentPlanSchema)) body: CreatePaymentPlanDto,
  ): Promise<PlanWithSchedule> {
    return this.projectRequestsService.createPaymentPlan(token, body);
  }

  @Get("public/requests/:token/proposal.pdf")
  async pdf(@Param("token") token: string, @Res() res: Response): Promise<void> {
    const enquiry = await this.projectRequestsService.getEnquiryByToken(token);
    const data = await this.proposalsService.pdfDataForEnquiry(enquiry.id);
    const buffer = await this.pdfService.renderProposal(data);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${data.reference}-proposal.pdf"`);
    res.send(buffer);
  }
}
