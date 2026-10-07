// Same rules as the backend's common/utils/tree-age.util.ts (used in the Excel
// reports), so the dashboard and the reports state a tree's age identically.

/** Whole months between two dates, not counting a final partial month. */
export function monthsBetween(from: Date | string, to: Date | string): number {
  const a = new Date(from);
  const b = new Date(to);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return months;
}

/** 0 -> "< 1 mo", 6 -> "6 mo", 12 -> "1 yr", 38 -> "3 yr 2 mo" */
export function formatAgeMonths(months: number): string {
  if (months <= 0) return "< 1 mo";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}

/** A tree's age at a date; empty when the planting date is unknown or later. */
export function formatTreeAge(plantingDate: Date | string | null | undefined, at: Date | string): string {
  if (!plantingDate) return "";
  const months = monthsBetween(plantingDate, at);
  return months < 0 ? "" : formatAgeMonths(months);
}
