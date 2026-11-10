import { isMonthKey, monthKey, monthRange, previousMonthKey } from './month';

describe('month utils', () => {
  it('validates month keys', () => {
    expect(isMonthKey('2026-11')).toBe(true);
    expect(isMonthKey('2026-13')).toBe(false);
    expect(isMonthKey('2026-1')).toBe(false);
  });

  it('builds a key from a date', () => {
    expect(monthKey(new Date(2026, 0, 31))).toBe('2026-01');
  });

  it('returns the range of a month, ending at the next month', () => {
    const { start, end } = monthRange('2026-12');
    expect(start).toEqual(new Date(2026, 11, 1));
    expect(end).toEqual(new Date(2027, 0, 1));
  });

  it('finds the previous month across a year boundary', () => {
    expect(previousMonthKey(new Date(2027, 0, 15))).toBe('2026-12');
  });
});
