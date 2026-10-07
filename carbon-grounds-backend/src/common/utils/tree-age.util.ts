/** Whole months between two dates, not counting a final partial month. */
export function monthsBetween(from: Date | string, to: Date | string): number {
  const a = new Date(from);
  const b = new Date(to);
  let months = (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
  if (b.getDate() < a.getDate()) months -= 1;
  return months;
}

/**
 * A tree's age at a given date, the way field teams talk about growth
 * checkpoints: "6 mo", "1 yr", "3 yr 2 mo". Empty when the planting date is
 * unknown or after the event.
 */
export function formatTreeAge(plantingDate: Date | string | null | undefined, at: Date | string): string {
  if (!plantingDate) return '';
  const months = monthsBetween(plantingDate, at);
  if (months < 0) return '';
  if (months === 0) return '< 1 mo';
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  return rest === 0 ? `${years} yr` : `${years} yr ${rest} mo`;
}
