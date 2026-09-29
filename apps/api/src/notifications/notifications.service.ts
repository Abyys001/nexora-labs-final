import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Estimate } from "@cybercina/pricing";
import { createTransport } from "nodemailer";
import type { Env } from "../config/env.schema.js";
import type { Enquiry } from "../db/schema.js";

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(private readonly config: ConfigService<Env, true>) {}

  /** Fire-and-forget: failures are logged, never thrown, so the caller's request never fails. */
  async notifyNewEnquiry(enquiry: Enquiry): Promise<void> {
    try {
      const smtpUrl = this.config.get("SMTP_URL", { infer: true });
      const to = this.config.get("NOTIFY_EMAIL_TO", { infer: true });

      if (!smtpUrl || !to) {
        this.logger.log(
          `New enquiry received id=${enquiry.id} source=${enquiry.source} email=${enquiry.email} (no SMTP configured, skipping email)`,
        );
        return;
      }

      const from = this.config.get("MAIL_FROM", { infer: true }) ?? to;
      const transport = createTransport(smtpUrl);
      await transport.sendMail({
        from,
        to,
        subject: `New ${enquiry.source} enquiry from ${enquiry.name}`,
        text: [
          `Name: ${enquiry.name}`,
          `Email: ${enquiry.email}`,
          `Company: ${enquiry.company ?? "-"}`,
          `Project type: ${enquiry.projectType}`,
          `Budget: ${enquiry.budget}`,
          "",
          enquiry.description,
        ].join("\n"),
      });
      this.logger.log(`Enquiry notification email sent id=${enquiry.id}`);
    } catch (error) {
      this.logger.error(
        `Failed to send enquiry notification id=${enquiry.id}: ${(error as Error).message}`,
      );
    }
  }

  /** Fire-and-forget: failures are logged, never thrown. */
  async notifyNewProjectRequest(enquiry: Enquiry, estimate: Estimate, accessToken: string): Promise<void> {
    try {
      const smtpUrl = this.config.get("SMTP_URL", { infer: true });
      const to = this.config.get("NOTIFY_EMAIL_TO", { infer: true });
      const siteUrl = this.config.get("PUBLIC_SITE_URL", { infer: true });
      const customerLink = `${siteUrl.replace(/\/$/, "")}/p/${accessToken}`;

      if (!smtpUrl || !to) {
        this.logger.log(
          `New project request received reference=${enquiry.reference} email=${enquiry.email} estimate=£${estimate.total} (no SMTP configured, skipping email)`,
        );
        return;
      }

      const from = this.config.get("MAIL_FROM", { infer: true }) ?? to;
      const transport = createTransport(smtpUrl);
      await transport.sendMail({
        from,
        to,
        subject: `New project request ${enquiry.reference} from ${enquiry.name}`,
        text: [
          `Reference: ${enquiry.reference}`,
          `Name: ${enquiry.name}`,
          `Email: ${enquiry.email}`,
          `Company: ${enquiry.company ?? "-"}`,
          `Automated estimate: £${estimate.total.toLocaleString("en-GB")}`,
          `Customer link: ${customerLink}`,
        ].join("\n"),
      });
      this.logger.log(`Project request notification email sent reference=${enquiry.reference}`);
    } catch (error) {
      this.logger.error(`Failed to send project request notification reference=${enquiry.reference}: ${(error as Error).message}`);
    }
  }

  /** Emails the customer their private request link — only sent when SMTP is configured. */
  async notifyCustomerPrivateLink(enquiry: Enquiry, accessToken: string): Promise<void> {
    try {
      const smtpUrl = this.config.get("SMTP_URL", { infer: true });
      if (!smtpUrl) return;

      const siteUrl = this.config.get("PUBLIC_SITE_URL", { infer: true });
      const link = `${siteUrl.replace(/\/$/, "")}/p/${accessToken}`;
      const from = this.config.get("MAIL_FROM", { infer: true }) ?? this.config.get("NOTIFY_EMAIL_TO", { infer: true });
      if (!from) return;

      const transport = createTransport(smtpUrl);
      await transport.sendMail({
        from,
        to: enquiry.email,
        subject: `Your Cybercina project request ${enquiry.reference}`,
        text: [
          `Hi ${enquiry.name},`,
          "",
          `Thanks for your project request. Your reference is ${enquiry.reference}.`,
          `You can track it here: ${link}`,
          "",
          "We'll be in touch shortly.",
        ].join("\n"),
      });
      this.logger.log(`Customer private link email sent reference=${enquiry.reference}`);
    } catch (error) {
      this.logger.error(`Failed to send customer private link email reference=${enquiry.reference}: ${(error as Error).message}`);
    }
  }
}
