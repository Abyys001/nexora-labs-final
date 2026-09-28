import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Logger,
} from "@nestjs/common";
import type { Response } from "express";
import { CodedException, ValidationException } from "./exceptions.js";

type ErrorCode =
  | "VALIDATION_FAILED"
  | "INVALID_JSON"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "UNPROCESSABLE"
  | "PAYLOAD_TOO_LARGE"
  | "RATE_LIMITED"
  | "INTERNAL";

const CODE_BY_STATUS: Record<number, ErrorCode> = {
  400: "VALIDATION_FAILED",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "UNPROCESSABLE",
  429: "RATE_LIMITED",
};

const DEFAULT_MESSAGE: Record<ErrorCode, string> = {
  VALIDATION_FAILED: "Validation failed",
  INVALID_JSON: "Malformed JSON body",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  CONFLICT: "Conflict",
  UNPROCESSABLE: "Unprocessable entity",
  PAYLOAD_TOO_LARGE: "Payload too large",
  RATE_LIMITED: "Too many requests",
  INTERNAL: "Internal server error",
};

/** Any status Nest/Express hands us that isn't a well-known code still maps to that real status, never a silent 500. */
function codeForStatus(status: number): ErrorCode {
  if (CODE_BY_STATUS[status]) return CODE_BY_STATUS[status];
  if (status >= 500) return "INTERNAL";
  return "VALIDATION_FAILED";
}

/** body-parser/raw-body throw plain Errors (not HttpException) with a numeric `status`/`statusCode` for malformed JSON and oversized payloads. */
function bodyParserStatus(exception: unknown): number | undefined {
  if (!(exception instanceof Error)) return undefined;
  const withStatus = exception as Error & { status?: unknown; statusCode?: unknown; type?: unknown };
  const status = withStatus.status ?? withStatus.statusCode;
  return typeof status === "number" ? status : undefined;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ValidationException) {
      response.status(400).json({
        error: {
          code: "VALIDATION_FAILED",
          message: DEFAULT_MESSAGE.VALIDATION_FAILED,
          details: { fieldErrors: exception.fieldErrors },
        },
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const code = exception instanceof CodedException ? exception.code : codeForStatus(status);
      const httpResponse = exception.getResponse();
      const fallbackMessage = (DEFAULT_MESSAGE as Record<string, string>)[code] ?? exception.message;
      const message =
        typeof httpResponse === "string" ? httpResponse : ((httpResponse as { message?: string }).message ?? fallbackMessage);

      if (status >= 500) {
        this.logger.error(exception.message, exception.stack);
      }

      response.status(status).json({ error: { code, message } });
      return;
    }

    const parserStatus = bodyParserStatus(exception);
    if (parserStatus === 400) {
      response.status(400).json({ error: { code: "INVALID_JSON", message: DEFAULT_MESSAGE.INVALID_JSON } });
      return;
    }
    if (parserStatus === 413) {
      response.status(413).json({ error: { code: "PAYLOAD_TOO_LARGE", message: DEFAULT_MESSAGE.PAYLOAD_TOO_LARGE } });
      return;
    }

    const error = exception instanceof Error ? exception : new Error("Unknown error");
    this.logger.error(error.message, error.stack);
    response.status(500).json({
      error: { code: "INTERNAL", message: DEFAULT_MESSAGE.INTERNAL },
    });
  }
}
