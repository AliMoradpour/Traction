/**
 * Start of the user's local day as an ISO timestamp. The API treats a date
 * filter as "this instant plus 24 hours", so sending local midnight (rather
 * than a bare YYYY-MM-DD, which is read as UTC midnight) returns the tasks of
 * the user's own day in any time zone.
 */
export function localDayStartISO(date: Date = new Date()): string {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start.toISOString();
}
