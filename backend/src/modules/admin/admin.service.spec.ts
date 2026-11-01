import { AdminService } from './admin.service';

const DAY = 24 * 60 * 60 * 1000;
const NOW = new Date('2026-11-04T12:00:00Z'); // a Wednesday
const ago = (days: number) => new Date(NOW.getTime() - days * DAY);

type Row = { userId: string; _max: Record<string, Date | null> };

function makePrisma(opts: {
  users: { id: string; createdAt: Date }[];
  activity?: Partial<Record<string, Row[]>>;
  focusSeconds?: number | null;
  tasks?: number;
  completed?: number;
}) {
  const group = (name: string) => ({
    groupBy: jest.fn().mockResolvedValue(opts.activity?.[name] ?? []),
  });
  return {
    behaviorEvent: group('behaviorEvent'),
    goal: group('goal'),
    aIUsage: group('aIUsage'),
    feedback: group('feedback'),
    refreshToken: group('refreshToken'),
    task: {
      ...group('task'),
      count: jest.fn((args?: unknown) =>
        Promise.resolve(args ? (opts.completed ?? 0) : (opts.tasks ?? 0)),
      ),
    },
    focusSession: {
      ...group('focusSession'),
      aggregate: jest.fn().mockResolvedValue({ _sum: { duration: opts.focusSeconds ?? null } }),
    },
    user: {
      count: jest.fn().mockResolvedValue(opts.users.length),
      findMany: jest.fn().mockResolvedValue(opts.users),
    },
  };
}

describe('AdminService analytics', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterAll(() => jest.useRealTimers());

  it('reports focus minutes from seconds', async () => {
    const svc = new AdminService(makePrisma({ users: [], focusSeconds: 10 * 25 * 60 }) as never);
    expect((await svc.getUserEngagementStats()).totalFocusMinutes).toBe(250);
  });

  it('counts active users from activity rows, using a 7-day UTC window', async () => {
    const svc = new AdminService(
      makePrisma({
        users: [],
        activity: {
          task: [{ userId: 'a', _max: { createdAt: ago(0.1), completedAt: null } }], // today
          focusSession: [{ userId: 'b', _max: { startedAt: ago(5) } }], // this week
          behaviorEvent: [{ userId: 'c', _max: { createdAt: ago(7) } }], // 8 days back by calendar: excluded
        },
      }) as never,
    );
    const stats = await svc.getUserEngagementStats();
    expect(stats.activeToday).toBe(1);
    expect(stats.activeThisWeek).toBe(2);
  });

  it('measures retention as return activity, and returns null with no eligible cohort', async () => {
    const users = [
      { id: 'returned', createdAt: ago(10) },
      { id: 'churned', createdAt: ago(10) },
      { id: 'new', createdAt: ago(0.5) },
    ];
    const svc = new AdminService(
      makePrisma({
        users,
        activity: {
          refreshToken: [
            { userId: 'returned', _max: { createdAt: ago(1) } }, // came back 9 days after signup
            { userId: 'churned', _max: { createdAt: ago(10) } }, // only on signup day
            { userId: 'new', _max: { createdAt: ago(0.5) } },
          ],
        },
      }) as never,
    );
    const r = await svc.getRetentionStats();
    expect(r.day1).toBe(50);
    expect(r.day7).toBe(50);
    expect(r.cohorts.day1).toEqual({ rate: 50, cohort: 2, retained: 1 });

    const empty = new AdminService(
      makePrisma({ users: [{ id: 'new', createdAt: ago(0.5) }] }) as never,
    );
    expect(await empty.getRetentionStats()).toMatchObject({ day1: null, day3: null, day7: null });
  });
});
