// Unit conversion helpers for tree measurements.
// DBH is stored in the backend as centimeters (dbhCm); height as meters (heightM).

export const DBH_UNITS = [
  { value: "cm", label: "cm" },
  { value: "mm", label: "mm" },
  { value: "in", label: "in" },
];

export const HEIGHT_UNITS = [
  { value: "m", label: "m" },
  { value: "cm", label: "cm" },
  { value: "ft", label: "ft" },
  { value: "in", label: "in" },
];

const CM_PER_UNIT: Record<string, number> = { cm: 1, mm: 0.1, in: 2.54 };
const M_PER_UNIT: Record<string, number> = { m: 1, cm: 0.01, ft: 0.3048, in: 0.0254 };

/** Convert a DBH value in the given unit to centimeters (the storage unit). */
export function dbhToCm(value: number, unit: string): number {
  return value * (CM_PER_UNIT[unit] ?? 1);
}

/** Convert a DBH value stored in centimeters to the given display unit. */
export function cmToDbhUnit(cm: number, unit: string): number {
  return cm / (CM_PER_UNIT[unit] ?? 1);
}

/** Convert a height value in the given unit to meters (the storage unit). */
export function heightToM(value: number, unit: string): number {
  return value * (M_PER_UNIT[unit] ?? 1);
}

/** Convert a height value stored in meters to the given display unit. */
export function mToHeightUnit(m: number, unit: string): number {
  return m / (M_PER_UNIT[unit] ?? 1);
}
