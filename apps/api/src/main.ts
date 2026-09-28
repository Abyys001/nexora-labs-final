import "reflect-metadata";
import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import type { NextFunction, Request, Response } from "express";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { AdminSeedService } from "./auth/admin-seed.service.js";
import type { Env } from "./config/env.schema.js";
import { CurrenciesService } from "./currencies/currencies.service.js";
import { PricingService } from "./pricing/pricing.service.js";
import { ProjectsService } from "./projects/projects.service.js";
import { PaymentsService } from "./payments/payments.service.js";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ["log", "warn", "error"],
    bodyParser: false,
    // Needed for Stripe webhook signature verification (HMAC over the raw body) — req.rawBody.
    rawBody: true,
  });
  const config = app.get(ConfigService<Env, true>);

  app.set("trust proxy", 1);
  app.use(helmet());
  app.useBodyParser("json", { limit: "256kb" });
  app.useBodyParser("urlencoded", { extended: true, limit: "256kb" });
  // Nest's express adapter rethrows body-parser failures as a bare
  // BadRequestException, which is indistinguishable from a field-validation
  // failure by the time the exception filter sees it. Mapping them here, while
  // body-parser's own `type` discriminator still exists, keeps "malformed JSON"
  // and "payload too large" honest for API clients.
  app.use((error: (Error & { type?: string }) | undefined, _req: Request, res: Response, next: NextFunction) => {
    if (!error) return next();
    if (error.type === "entity.parse.failed") {
      res.status(400).json({ error: { code: "INVALID_JSON", message: "Malformed JSON body" } });
      return;
    }
    if (error.type === "entity.too.large") {
      res.status(413).json({ error: { code: "PAYLOAD_TOO_LARGE", message: "Payload too large" } });
      return;
    }
    return next(error);
  });
  app.enableCors({ origin: config.get("CORS_ORIGIN", { infer: true }) });
  app.setGlobalPrefix("api");
  app.enableShutdownHooks();

  // Runs module lifecycle hooks now (migrations included) so seeding sees a ready DB.
  await app.init();
  await app.get(AdminSeedService).seed();
  await app.get(CurrenciesService).seedIfEmpty();
  await app.get(PricingService).seedIfEmpty();
  await app.get(ProjectsService).seedIfEmpty();

  // Network calls and background timers stay off in tests — see docs/architecture/commercial-flow.md §4.
  if (config.get("NODE_ENV", { infer: true }) !== "test") {
    void app.get(CurrenciesService).refreshOnBootAndSchedule();
  }
  app.get(PaymentsService).scheduleStatusRecompute();

  const port = config.get("PORT", { infer: true });
  await app.listen(port);
  Logger.log(`API listening on port ${port}`, "Bootstrap");
}

void bootstrap();
