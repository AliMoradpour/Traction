import {
  addDays,
  addMonths,
  dayKey,
  localDayStartISO,
  localNoonISO,
  monthGrid,
  monthKey,
  monthRangeISO,
  parseDayKey,
  parseMonthKey,
  relativeDayLabel,
} from '../dates';

describe('localDayStartISO', () => {
  it('returns local midnight of the given day', () => {
    const lateEvening = new Date(2026, 10, 4, 23, 45);
    const start = new Date(localDayStartISO(lateEvening));
    expect(start.getFullYear()).toBe(2026);
    expect(start.getMonth()).toBe(10);
    expect(start.getDate()).toBe(4);
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);
  });

  it('keeps an early-morning time on the same local day', () => {
    const earlyMorning = new Date(2026, 10, 4, 0, 30);
    expect(new Date(localDayStartISO(earlyMorning)).getDate()).toBe(4);
  });
});

describe('localNoonISO', () => {
  it('returns local noon of the same day, even just after midnight', () => {
    const noon = new Date(localNoonISO(new Date(2026, 10, 4, 0, 10)));
    expect(noon.getDate()).toBe(4);
    expect(noon.getHours()).toBe(12);
  });
});

describe('day and month keys', () => {
  it('round-trips a day key', () => {
    const d = new Date(2026, 0, 5);
    expect(dayKey(d)).toBe('2026-01-05');
    expect(parseDayKey('2026-01-05')).toEqual(d);
    expect(parseDayKey('nonsense')).toBeNull();
  });

  it('round-trips a month key', () => {
    expect(monthKey(new Date(2026, 8, 30))).toBe('2026-09');
    expect(parseMonthKey('2026-09')).toEqual(new Date(2026, 8, 1));
  });

  it('adds days and months across boundaries', () => {
    expect(addDays(new Date(2026, 11, 31), 1)).toEqual(new Date(2027, 0, 1));
    expect(addMonths(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 1));
  });
});

describe('monthRangeISO', () => {
  it('covers the month from local start to the next month start', () => {
    const { from, to } = monthRangeISO(new Date(2026, 1, 14));
    expect(new Date(from)).toEqual(new Date(2026, 1, 1));
    expect(new Date(to)).toEqual(new Date(2026, 2, 1));
  });
});

describe('monthGrid', () => {
  it('starts weeks on Monday and pads with nulls', () => {
    // November 2026 starts on a Sunday.
    const weeks = monthGrid(new Date(2026, 10, 1));
    expect(weeks[0].slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(weeks[0][6]?.getDate()).toBe(1);
    expect(weeks.every((w) => w.length === 7)).toBe(true);
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(30);
  });
});

describe('relativeDayLabel', () => {
  const now = new Date(2026, 10, 11, 9);
  it('names nearby days', () => {
    expect(relativeDayLabel(new Date(2026, 10, 11), now)).toBe('Today');
    expect(relativeDayLabel(new Date(2026, 10, 12), now)).toBe('Tomorrow');
    expect(relativeDayLabel(new Date(2026, 10, 10), now)).toBe('Yesterday');
  });
});
