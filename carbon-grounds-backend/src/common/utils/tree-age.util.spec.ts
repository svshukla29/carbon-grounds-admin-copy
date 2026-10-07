import { formatTreeAge, monthsBetween } from './tree-age.util';

describe('tree age', () => {
  it('counts whole months only', () => {
    expect(monthsBetween('2024-07-15', '2025-01-14')).toBe(5);
    expect(monthsBetween('2024-07-15', '2025-01-15')).toBe(6);
  });

  it.each([
    ['2024-07-01', '2024-07-20', '< 1 mo'],
    ['2024-07-01', '2025-01-01', '6 mo'],
    ['2024-07-01', '2025-07-01', '1 yr'],
    ['2024-07-01', '2027-09-01', '3 yr 2 mo'],
  ])('planted %s, measured %s -> %s', (planted, at, expected) => {
    expect(formatTreeAge(planted, at)).toBe(expected);
  });

  it('is blank when the planting date is unknown or later than the event', () => {
    expect(formatTreeAge(null, '2025-01-01')).toBe('');
    expect(formatTreeAge('2025-06-01', '2025-01-01')).toBe('');
  });
});
