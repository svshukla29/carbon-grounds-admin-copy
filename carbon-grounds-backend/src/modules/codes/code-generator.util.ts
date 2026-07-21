import { STATE_CODES } from './state-codes.const';

/** Convert a full state name to its short code, deriving one if not in the known list */
export function getStateCode(state: string): string {
  const known = STATE_CODES[state?.trim()];
  if (known) return known;
  const letters = (state || '').replace(/[^a-zA-Z]/g, '').toUpperCase();
  return letters.slice(0, 2) || 'XX';
}

/** Pull the trailing numeric sequence out of a generated code, e.g. 'GP-JH-RAN-7' -> 7 */
export function extractSeq(code: string): number {
  const last = code?.split('-').pop() ?? '';
  const n = parseInt(last, 10);
  return isNaN(n) ? 0 : n;
}
