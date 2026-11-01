import { computeGoalForecast } from './goal-forecast';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-01T12:00:00Z');
const ago = (days: number) => new Date(NOW.getTime() - days * DAY);
const ahead = (days: number) => new Date(NOW.getTime() + days * DAY);

describe('computeGoalForecast', () => {
  it('reports a completed goal as certain', () => {
    const f = computeGoalForecast(
      { progress: 100, startDate: ago(30), targetDate: ahead(10) },
      NOW,
    );
    expect(f.probability).toBe(1);
    expect(f.onTrack).toBe(true);
    expect(f.timeline).toBe('Completed');
  });

  it('gives no probability without a target date, but still projects a finish', () => {
    const f = computeGoalForecast({ progress: 50, startDate: ago(20), targetDate: null }, NOW);
    expect(f.probability).toBeNull();
    expect(f.onTrack).toBeNull();
    expect(f.currentPace).toBe(2.5);
    expect(f.projectedDaysToFinish).toBe(20);
    expect(f.recommendation).toMatch(/Set a target date/);
  });

  it('is on track and likely when ahead of the required pace', () => {
    // 60% in 30 days = 2%/day; needs 40% in 40 days = 1%/day.
    const f = computeGoalForecast({ progress: 60, startDate: ago(30), targetDate: ahead(40) }, NOW);
    expect(f.onTrack).toBe(true);
    expect(f.requiredPace).toBe(1);
    expect(f.projectedDaysToFinish).toBe(20);
    expect(f.probability!).toBeGreaterThan(0.7);
    expect(f.readiness).toBe('high');
    expect(f.confidence).toBe('high');
    expect(f.timeline).toMatch(/20 days early/);
  });

  it('is behind and unlikely when well under the required pace', () => {
    // 10% in 30 days; needs 90% in 10 days.
    const f = computeGoalForecast({ progress: 10, startDate: ago(30), targetDate: ahead(10) }, NOW);
    expect(f.onTrack).toBe(false);
    expect(f.probability!).toBeLessThan(0.2);
    expect(f.readiness).toBe('low');
    expect(f.timeline).toMatch(/past the deadline/);
    expect(f.recommendation).toMatch(/Raise your effort/);
  });

  it('gets more likely as pace improves, all else equal', () => {
    const at = (progress: number) =>
      computeGoalForecast({ progress, startDate: ago(30), targetDate: ahead(30) }, NOW)
        .probability!;
    expect(at(20)).toBeLessThan(at(40));
    expect(at(40)).toBeLessThan(at(60));
  });

  it('does not condemn a brand-new goal that has no progress yet', () => {
    const f = computeGoalForecast({ progress: 0, startDate: NOW, targetDate: ahead(60) }, NOW);
    expect(f.confidence).toBe('low');
    expect(f.probability!).toBeGreaterThan(0.2);
    expect(f.projectedDaysToFinish).toBeNull();
    expect(f.recommendation).toMatch(/first progress/);
  });

  it('marks an overdue goal as off track', () => {
    const f = computeGoalForecast({ progress: 70, startDate: ago(60), targetDate: ago(5) }, NOW);
    expect(f.onTrack).toBe(false);
    expect(f.probability).toBe(0.05);
    expect(f.daysRemaining).toBe(-5);
    expect(f.timeline).toMatch(/passed 5 days ago/);
  });

  it('keeps probability inside its bounds', () => {
    const f = computeGoalForecast(
      { progress: 99, startDate: ago(10), targetDate: ahead(300) },
      NOW,
    );
    expect(f.probability).toBe(0.95);
  });
});
