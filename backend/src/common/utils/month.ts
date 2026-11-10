/**
 * Calendar-month helpers. Months are "YYYY-MM" strings; boundaries are in the
 * server's local time zone (set TZ to the owner's zone when hosting).
 */
const MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

export function isMonthKey(value: string): boolean {
  return MONTH_PATTERN.test(value);
}

export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** First instant of the month and first instant of the following month. */
export function monthRange(month: string): { start: Date; end: Date } {
  const match = MONTH_PATTERN.exec(month);
  if (!match) throw new Error(`Invalid month: ${month}`);
  const year = Number(match[1]);
  const index = Number(match[2]) - 1;
  return { start: new Date(year, index, 1), end: new Date(year, index + 1, 1) };
}

export function previousMonthKey(now: Date = new Date()): string {
  return monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}
