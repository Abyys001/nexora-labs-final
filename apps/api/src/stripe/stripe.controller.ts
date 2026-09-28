import { Body, Controller, Headers, HttpCode, NotFoundException, Param, Post, Req } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Request } from "express";
import { CodedException } from "../common/exceptions.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { Env } from "../config/env.schema.js";
import { ProjectRequestsService } from "../project-requests/project-requests.service.js";
import { z } from "zod";
import { StripeService } from "./stripe.service.js";

const checkoutSchema = z.object({ scheduleItemId: z.uuid() });

@Controller()
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly projectRequestsService: ProjectRequestsService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  @Post("public/requests/:token/checkout")
  async checkout(
    @Param("token") token: string,
    @Body(new ZodValidationPipe(checkoutSchema)) body: { scheduleItemId: string },
  ): Promise<{ url: string }> {
    const enquiry = await this.projectRequestsService.getEnquiryByToken(token);
    const view = await this.projectRequestsService.getPublicView(token);
    const item = view.paymentPlan?.items.find((i) => i.id === body.scheduleItemId);
    if (!item) throw new NotFoundException("Schedule item not found");

    const siteUrl = this.config.get("PUBLIC_SITE_URL", { infer: true }).replace(/\/$/, "");
    return this.stripeService.createCheckoutSession({
      scheduleItemId: item.id,
      amountGbp: item.amountGbp,
      amountInCurrency: item.amountInCurrency,
      currency: view.currency ?? "GBP",
      description: `${enquiry.reference} — ${item.label}`,
      reference: enquiry.reference ?? enquiry.id,
      customerEmail: enquiry.email,
      successUrl: `${siteUrl}/p/${token}?payment=success`,
      cancelUrl: `${siteUrl}/p/${token}?payment=cancelled`,
    });
  }

  @Post("webhooks/stripe")
  @HttpCode(200)
  async webhook(@Req() req: Request, @Headers("stripe-signature") signature: string | undefined): Promise<{ received: true }> {
    const secret = this.config.get("STRIPE_WEBHOOK_SECRET", { infer: true });
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!secret || !signature || !rawBody || !this.stripeService.verifySignature(rawBody, signature, secret)) {
      throw new CodedException(400, "INVALID_SIGNATURE", "Invalid Stripe webhook signature");
    }

    await this.stripeService.handleWebhookEvent(req.body);
    return { received: true };
  }
}
