/** Round half-up to the nearest multiple of `step` (step > 0). */
export function roundToStep(amount: number, step: number): number {
  if (step <= 0) return amount;
  return Math.round(amount / step) * step;
}
