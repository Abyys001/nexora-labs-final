import { createHmac, timingSafeEqual } from "node:crypto";
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Env } from "../config/env.schema.js";
import { CodedException } from "../common/exceptions.js";
import { PaymentsService } from "../payments/payments.service.js";

const STRIPE_API_URL = "https://api.stripe.com/v1";
const SIGNATURE_TOLERANCE_SECONDS = 5 * 60;

export interface CheckoutSessionInput {
  scheduleItemId: string;
  amountGbp: number;
  amountInCurrency: number | null;
  currency: string;
  description: string;
  reference: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
}

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);

  constructor(
    private readonly config: ConfigService<Env, true>,
    private readonly paymentsService: PaymentsService,
  ) {}

  isEnabled(): boolean {
    return Boolean(this.config.get("STRIPE_SECRET_KEY", { infer: true }));
  }

  async createCheckoutSession(input: CheckoutSessionInput): Promise<{ url: string }> {
    const secretKey = this.config.get("STRIPE_SECRET_KEY", { infer: true });
    if (!secretKey) {
      throw new CodedException(404, "PAYMENTS_OFFLINE", "Card payments are not currently available");
    }

    const currency = input.currency.toLowerCase();
    const unitAmount = Math.round((input.currency === "GBP" ? input.amountGbp : (input.amountInCurrency ?? input.amountGbp)) * 100);

    const body = new URLSearchParams({
      mode: "payment",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": currency,
      "line_items[0][price_data][unit_amount]": String(unitAmount),
      "line_items[0][price_data][product_data][name]": input.description,
      "metadata[scheduleItemId]": input.scheduleItemId,
      "metadata[reference]": input.reference,
      customer_email: input.customerEmail,
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });

    const res = await fetch(`${STRIPE_API_URL}/checkout/sessions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    const json = (await res.json()) as { url?: string; error?: { message: string } };
    if (!res.ok || !json.url) {
      this.logger.error(`Stripe checkout session creation failed: ${json.error?.message ?? res.statusText}`);
      throw new CodedException(502, "PAYMENT_PROVIDER_ERROR", "Could not start checkout with the payment provider");
    }
    return { url: json.url };
  }

  /** HMAC-SHA256 over `${t}.${rawBody}`, constant-time compared, 5 minute tolerance. */
  verifySignature(rawBody: Buffer, signatureHeader: string, secret: string): boolean {
    const parts = Object.fromEntries(signatureHeader.split(",").map((part) => part.split("=") as [string, string]));
    const timestamp = parts.t;
    const signature = parts.v1;
    if (!timestamp || !signature) return false;

    const age = Math.abs(Date.now() / 1000 - Number(timestamp));
    if (!Number.isFinite(age) || age > SIGNATURE_TOLERANCE_SECONDS) return false;

    const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody.toString("utf8")}`).digest("hex");
    const expectedBuf = Buffer.from(expected, "hex");
    const actualBuf = Buffer.from(signature, "hex");
    if (expectedBuf.length !== actualBuf.length) return false;
    return timingSafeEqual(expectedBuf, actualBuf);
  }

  async handleWebhookEvent(event: { type: string; data: { object: Record<string, unknown> } }): Promise<void> {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadata = session.metadata as Record<string, string> | undefined;
      const scheduleItemId = metadata?.scheduleItemId;
      const paymentIntent = session.payment_intent as string | undefined;
      const amountTotal = session.amount_total as number | undefined;
      if (!scheduleItemId || !paymentIntent || amountTotal === undefined) {
        this.logger.warn("checkout.session.completed missing scheduleItemId/payment_intent/amount_total, ignoring");
        return;
      }
      await this.paymentsService.recordStripePayment(scheduleItemId, Math.round(amountTotal / 100), paymentIntent);
      return;
    }

    if (event.type === "charge.refunded") {
      const charge = event.data.object;
      const paymentIntent = charge.payment_intent as string | undefined;
      if (!paymentIntent) return;
      await this.paymentsService.refundByProviderRef(paymentIntent);
    }
  }
}
