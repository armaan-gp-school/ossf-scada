/**
 * Placeholder default ranges when no per-property threshold is set in DB.
 * FLOAT: 3.0–3.5, INT: 1–2 (per plan).
 */
export const DEFAULT_FLOAT_MIN = 3.0;
export const DEFAULT_FLOAT_MAX = 3.5;
export const DEFAULT_INT_MIN = 1;
export const DEFAULT_INT_MAX = 2;

export interface PropertyForAlert {
  type: string;
  last_value: unknown;
}

export interface ThresholdRange {
  min: number;
  max: number;
}

/**
 * Returns whether a property value is outside the given range (in alert).
 * Uses placeholder defaults when range is not provided (for INT/FLOAT only).
 */
export function isPropertyInAlert(
  property: PropertyForAlert,
  range?: ThresholdRange | null
): boolean {
  const t = (property.type || "").toUpperCase();
  if (t !== "INT" && t !== "FLOAT") return false;

  const val = property.last_value;
  const num = typeof val === "number" ? val : Number(val);
  if (Number.isNaN(num)) return false;

  const min = range?.min ?? (t === "FLOAT" ? DEFAULT_FLOAT_MIN : DEFAULT_INT_MIN);
  const max = range?.max ?? (t === "FLOAT" ? DEFAULT_FLOAT_MAX : DEFAULT_INT_MAX);
  return num < min || num > max;
}
