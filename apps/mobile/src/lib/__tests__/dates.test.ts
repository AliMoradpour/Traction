import { localDayStartISO } from '../dates';

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
