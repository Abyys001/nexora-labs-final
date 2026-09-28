import { createHash } from "node:crypto";
import { Body, Controller, Post, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Throttle } from "@nestjs/throttler";
import type { Request } from "express";
import type { Env } from "../config/env.schema.js";
import { getClientIp } from "../common/client-ip.util.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { CreateEnquiryDto, createEnquirySchema } from "./dto/create-enquiry.dto.js";
import { EnquiriesService } from "./enquiries.service.js";

@Controller("enquiries")
export class EnquiriesController {
  constructor(
    private readonly enquiriesService: EnquiriesService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  create(
    @Body(new ZodValidationPipe(createEnquirySchema)) body: CreateEnquiryDto,
    @Req() req: Request,
  ): Promise<{ id: string }> {
    const ip = getClientIp(req);
    const salt = this.config.get("IP_HASH_SALT", { infer: true });
    const ipHash = ip ? createHash("sha256").update(`${ip}${salt}`).digest("hex") : null;
    const userAgent = req.headers["user-agent"] ?? null;
    return this.enquiriesService.create(body, { ipHash, userAgent });
  }
}
