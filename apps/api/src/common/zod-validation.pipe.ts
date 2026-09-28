import { PipeTransform } from "@nestjs/common";
import type { ZodType } from "zod";
import { ValidationException } from "./exceptions.js";
import type { FieldErrors } from "./exceptions.js";

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodType) {}

  transform(value: unknown): unknown {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".") || "_root";
        (fieldErrors[key] ??= []).push(issue.message);
      }
      throw new ValidationException(fieldErrors);
    }
    return result.data;
  }
}
