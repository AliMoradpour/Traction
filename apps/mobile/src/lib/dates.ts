/**
 * Date helpers. Everything works in the user's local time zone; the API gets
 * absolute instants (ISO strings), so a task lands on the user's own day in
 * any time zone.
 */

/**
 * Start of the user's local day as an ISO timestamp. The API treats a date
 * filter as "this instant plus 24 hours", so sending local midnight (rather
 * than a bare YYYY-MM-DD, which is read as UTC midnight) returns the tasks of
 * the user's own day in any time zone.
 */
export function localDayStartISO(date: Date = new Date()): string {
  return startOfDay(date).toISOString();
}

/** Midday of the given local day. Used when scheduling, so small clock or zone shifts can't move a task to another day. */
export function localNoonISO(date: Date = new Date()): string {
  const d = startOfDay(date);
  d.setHours(12);
  return d.toISOString();
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Local calendar day as "YYYY-MM-DD" (for route params and grouping). */
export function dayKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Parse a "YYYY-MM-DD" day key as a local date. Returns null for anything else. */
export function parseDayKey(key: string | undefined | null): Date | null {
  const match = key ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(key) : null;
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

/** "YYYY-MM" of a local date. */
export function monthKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

export function parseMonthKey(key: string | undefined | null): Date | null {
  const match = key ? /^(\d{4})-(\d{2})$/.exec(key) : null;
  if (!match) return null;
  return new Date(Number(match[1]), Number(match[2]) - 1, 1);
}

export function addMonths(date: Date, months: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

/** Local range [start, end) of the month containing `date`, as ISO instants for the API. */
export function monthRangeISO(date: Date): { from: string; to: string } {
  return {
    from: new Date(date.getFullYear(), date.getMonth(), 1).toISOString(),
    to: new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString(),
  };
}

/** Local range [start of `date`, start of `date` + days) as ISO instants. */
export function daysRangeISO(date: Date, days: number): { from: string; to: string } {
  return { from: startOfDay(date).toISOString(), to: addDays(date, days).toISOString() };
}

/**
 * Weeks of the month for a calendar grid, Monday first. Days outside the
 * month are null so the grid keeps its shape.
 */
export function monthGrid(month: Date): (Date | null)[][] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7; // Monday = 0
  const cells: (Date | null)[] = Array.from({ length: leading }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "Today", "Tomorrow", "Yesterday" or e.g. "Thu, Nov 20". */
export function relativeDayLabel(date: Date, now: Date = new Date()): string {
  if (isSameDay(date, now)) return 'Today';
  if (isSameDay(date, addDays(now, 1))) return 'Tomorrow';
  if (isSameDay(date, addDays(now, -1))) return 'Yesterday';
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function monthLabel(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
