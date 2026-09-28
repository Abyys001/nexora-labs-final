import type { Rounding } from "./types.js";

/**
 * Converts a GBP amount to another currency at `rate` (units per 1 GBP),
 * rounding half-up to the currency's configured step. "none" keeps two
 * decimal places (cents) rather than rounding to a whole unit.
 */
export function convert(amountGbp: number, rate: number, rounding: Rounding): number {
  const raw = amountGbp * rate;
  if (rounding === "none") {
    return Math.round(raw * 100) / 100;
  }
  return Math.round(raw / rounding) * rounding;
}
