import { BadRequestException, HttpException } from "@nestjs/common";

export type FieldErrors = Record<string, string[]>;

/** Thrown by ZodValidationPipe; carries per-field messages for the error envelope. */
export class ValidationException extends BadRequestException {
  constructor(public readonly fieldErrors: FieldErrors) {
    super({ fieldErrors });
  }
}

/** An HttpException with an explicit error envelope code, for cases the generic status->code map doesn't cover. */
export class CodedException extends HttpException {
  constructor(
    status: number,
    public readonly code: string,
    message: string,
  ) {
    super({ message }, status);
  }
}
