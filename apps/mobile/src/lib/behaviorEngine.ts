import { BehaviorEvent, FocusSession, Task } from '@/services';

// ===== TYPES =====

export interface DailyMetrics {
  date: string;
  tasksPlanned: number;
  tasksCompleted: number;
  completionRate: number;
  averageStartDelay: number;
  averageCompletionDelay: number;
  deepWorkMinutes: number;
  focusSessions: number;
  eventsCount: number;
}

export interface WeeklyMetrics {
  weekStart: string;
  weekEnd: string;
  consistency: number;
  weeklyCompletion: number;
  missedTasks: number;
  delayedTasks: number;
  planningAccuracy: number;
  averageDailyOutput: number;
}

export interface BehaviorIndicators {
  consistencyScore: number;
  executionScore: number;
  reliabilityScore: number;
  planningAccuracy: number;
  momentumScore: number;
  recoveryScore: number;
}

export interface BurnoutRisk {
  level: 'low' | 'moderate' | 'high' | 'critical';
  score: number;
  signals: string[];
  trend: 'improving' | 'stable' | 'worsening';
}

export interface ProcrastinationProfile {
  score: number;
  patterns: string[];
  peakProcrastinationTime: string;
  commonReasons: string[];
  frequency: number;
}

export interface BehaviorTimeline {
  events: BehaviorEvent[];
  dailyBreakdown: DailyMetrics[];
  weeklyBreakdown: WeeklyMetrics[];
}

// ===== DATE HELPERS =====

function toDateOnly(dateStr: string): string {
  return dateStr.slice(0, 10);
}

function isSameDay(dateStr1: string, dateStr2: string): boolean {
  return toDateOnly(dateStr1) === toDateOnly(dateStr2);
}

function isInRange(dateStr: string, startStr: string, endStr: string): boolean {
  const d = toDateOnly(dateStr);
  const s = toDateOnly(startStr);
  const e = toDateOnly(endStr);
  return d >= s && d <= e;
}

function toMinutes(ms: number): number {
  return Math.round(ms / 60000);
}

function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function getHour(dateStr: string): number {
  return new Date(dateStr).getHours();
}

function diffMinutes(a: string, b: string): number {
  return toMinutes(new Date(b).getTime() - new Date(a).getTime());
}

function getEventTypes(events: BehaviorEvent[]): string[] {
  return events.map((e) => e.type);
}

function taskScheduledOnDay(task: Task, day: string): boolean {
  return task.scheduledAt ? isSameDay(task.scheduledAt, day) : false;
}

function taskCompletedOnDay(task: Task, day: string): boolean {
  return task.completedAt ? isSameDay(task.completedAt, day) : false;
}

function focusSessionOnDay(session: FocusSession, day: string): boolean {
  return isSameDay(session.startedAt, day);
}

function eventsOnDay(events: BehaviorEvent[], day: string): BehaviorEvent[] {
  return events.filter((e) => isSameDay(e.createdAt, day));
}

// ===== CALCULATION FUNCTIONS =====

export function calculateDailyMetrics(
  date: string,
  tasks: Task[],
  events: BehaviorEvent[],
  focusSessions: FocusSession[]
): DailyMetrics {
  const dayEvents = eventsOnDay(events, date);
  const tasksPlanned = tasks.filter((t) => taskScheduledOnDay(t, date)).length;
  const tasksCompleted = tasks.filter((t) => taskCompletedOnDay(t, date)).length;
  const completionRate = tasksPlanned > 0 ? Math.round((tasksCompleted / tasksPlanned) * 100) : 0;

  let startDelaySum = 0;
  let startDelayCount = 0;
  let completionDelaySum = 0;
  let completionDelayCount = 0;

  const scheduledTasks = tasks.filter((t) => taskScheduledOnDay(t, date));
  for (const task of scheduledTasks) {
    const taskEvents = dayEvents.filter((e) => e.taskId === task.id);
    if (task.scheduledAt && taskEvents.length > 0) {
      const earliestEvent = taskEvents.reduce((earliest, e) =>
        e.createdAt < earliest.createdAt ? e : earliest
      );
      startDelaySum += diffMinutes(task.scheduledAt, earliestEvent.createdAt);
      startDelayCount++;
    }
    if (task.scheduledAt && task.dueAt && task.completedAt && task.status === 'COMPLETED') {
      completionDelaySum += diffMinutes(task.dueAt, task.completedAt);
      completionDelayCount++;
    }
  }

  const dayFocusSessions = focusSessions.filter((s) => focusSessionOnDay(s, date));
  const deepWorkMinutes = dayFocusSessions.reduce(
    (sum, s) => sum + (s.duration ? s.duration / 60 : 0),
    0
  );

  return {
    date: toDateOnly(date),
    tasksPlanned,
    tasksCompleted,
    completionRate,
    averageStartDelay: startDelayCount > 0 ? Math.round(startDelaySum / startDelayCount) : 0,
    averageCompletionDelay: completionDelayCount > 0 ? Math.round(completionDelaySum / completionDelayCount) : 0,
    deepWorkMinutes: Math.round(deepWorkMinutes),
    focusSessions: dayFocusSessions.length,
    eventsCount: dayEvents.length,
  };
}

export function calculateWeeklyMetrics(
  weekStart: string,
  tasks: Task[],
  events: BehaviorEvent[],
  focusSessions: FocusSession[]
): WeeklyMetrics {
  const weekEnd = addDays(weekStart, 6);
  const now = new Date();
  const nowStr = now.toISOString().slice(0, 10);

  let daysWithActivity = 0;
  let weeklyCompletion = 0;
  let missedTasks = 0;
  let delayedTasks = 0;
  let tasksPlanned = 0;

  for (let i = 0; i < 7; i++) {
    const day = addDays(weekStart, i);
    const dayEvents = eventsOnDay(events, day);
    if (dayEvents.length > 0) daysWithActivity++;

    const dayScheduled = tasks.filter((t) => taskScheduledOnDay(t, day));
    tasksPlanned += dayScheduled.length;

    for (const task of tasks.filter((t) => taskCompletedOnDay(t, day))) {
      weeklyCompletion++;
      if (task.dueAt && task.completedAt && task.completedAt > task.dueAt) {
        delayedTasks++;
      }
    }

    if (day <= nowStr) {
      const dayDue = tasks.filter((t) => t.dueAt && isSameDay(t.dueAt, day));
      for (const task of dayDue) {
        if (task.status !== 'COMPLETED') {
          missedTasks++;
        }
      }
    }
  }

  const consistency = Math.round((daysWithActivity / 7) * 100);
  const planningAccuracy = tasksPlanned > 0 ? Math.round((weeklyCompletion / tasksPlanned) * 100) : 0;

  return {
    weekStart,
    weekEnd,
    consistency,
    weeklyCompletion,
    missedTasks,
    delayedTasks,
    planningAccuracy,
    averageDailyOutput: Math.round((weeklyCompletion / 7) * 10) / 10,
  };
}

export function calculateBehaviorIndicators(
  tasks: Task[],
  events: BehaviorEvent[],
  focusSessions: FocusSession[],
  days = 30
): BehaviorIndicators {
  const now = new Date();
  const nowStr = now.toISOString();
  const startStr = addDays(nowStr, -days);

  const recentEvents = events.filter((e) => isInRange(e.createdAt, startStr, nowStr));
  const recentTasks = tasks.filter(
    (t) => isInRange(t.createdAt, startStr, nowStr) || isInRange(t.scheduledAt || '', startStr, nowStr)
  );

  const activeDays = new Set<string>();
  for (const e of recentEvents) activeDays.add(toDateOnly(e.createdAt));
  const consistencyScore = days > 0 ? Math.round((activeDays.size / days) * 100) : 0;

  const scheduledTasks = recentTasks.filter((t) => t.scheduledAt);
  const completedScheduled = scheduledTasks.filter((t) => t.status === 'COMPLETED');
  const executionScore =
    scheduledTasks.length > 0
      ? Math.round((completedScheduled.length / scheduledTasks.length) * 100)
      : 0;

  const tasksWithDue = recentTasks.filter((t) => t.dueAt && t.status === 'COMPLETED');
  const onTimeTasks = tasksWithDue.filter((t) => t.completedAt && t.completedAt <= t.dueAt!);
  const reliabilityScore =
    tasksWithDue.length > 0 ? Math.round((onTimeTasks.length / tasksWithDue.length) * 100) : 0;

  const tasksWithSchedule = recentTasks.filter((t) => t.scheduledAt && t.status === 'COMPLETED');
  const onTimeScheduled = tasksWithSchedule.filter(
    (t) => t.completedAt && t.scheduledAt && t.completedAt <= t.scheduledAt
  );
  const planningAccuracy =
    tasksWithSchedule.length > 0
      ? Math.round((onTimeScheduled.length / tasksWithSchedule.length) * 100)
      : 0;

  let momentumScore = 0;
  const recentHalf = Math.ceil(days / 2);
  const recentRecentEvents = recentEvents.filter((e) =>
    isInRange(e.createdAt, addDays(nowStr, -recentHalf), nowStr)
  );
  const recentRecentTasks = recentTasks.filter(
    (t) =>
      isInRange(t.createdAt, addDays(nowStr, -recentHalf), nowStr) ||
      isInRange(t.scheduledAt || '', addDays(nowStr, -recentHalf), nowStr)
  );
  const recentScheduled = recentRecentTasks.filter((t) => t.scheduledAt);
  const recentCompleted = recentScheduled.filter((t) => t.status === 'COMPLETED');
  const recentConsistency = new Set(
    recentRecentEvents.map((e) => toDateOnly(e.createdAt))
  ).size;
  momentumScore = Math.round(
    recentScheduled.length > 0
      ? ((recentCompleted.length / recentScheduled.length) * 50 +
          (recentConsistency / recentHalf) * 50)
      : recentConsistency / recentHalf * 100
  );

  let recoveryScore = 0;
  const behindTasks = recentTasks.filter(
    (t) => t.dueAt && new Date(t.dueAt) < now && t.status !== 'COMPLETED'
  );
  const recoveredTasks = behindTasks.filter(
    (t) => t.status === 'COMPLETED' && t.completedAt
  );
  recoveryScore =
    behindTasks.length > 0
      ? Math.round((recoveredTasks.length / behindTasks.length) * 100)
      : 100;

  return {
    consistencyScore: Math.min(100, Math.max(0, consistencyScore)),
    executionScore: Math.min(100, Math.max(0, executionScore)),
    reliabilityScore: Math.min(100, Math.max(0, reliabilityScore)),
    planningAccuracy: Math.min(100, Math.max(0, planningAccuracy)),
    momentumScore: Math.min(100, Math.max(0, momentumScore)),
    recoveryScore: Math.min(100, Math.max(0, recoveryScore)),
  };
}

export function calculateBurnoutRisk(
  tasks: Task[],
  events: BehaviorEvent[],
  focusSessions: FocusSession[]
): BurnoutRisk {
  const now = new Date();
  const nowStr = now.toISOString();
  const twoWeeksAgo = addDays(nowStr, -14);
  const lastWeekStart = startOfWeek(addDays(nowStr, -7));
  const thisWeekStart = startOfWeek(nowStr);

  let score = 0;
  const signals: string[] = [];

  const recentEvents = events.filter((e) => isInRange(e.createdAt, twoWeeksAgo, nowStr));
  const thisWeekEvents = recentEvents.filter((e) => isInRange(e.createdAt, thisWeekStart, nowStr));
  const lastWeekEvents = recentEvents.filter(
    (e) => isInRange(e.createdAt, lastWeekStart, addDays(lastWeekStart, 6))
  );

  const thisWeekCompleted = thisWeekEvents.filter((e) => e.type === 'TASK_COMPLETED').length;
  const lastWeekCompleted = lastWeekEvents.filter((e) => e.type === 'TASK_COMPLETED').length;
  if (lastWeekCompleted > 0 && thisWeekCompleted < lastWeekCompleted) {
    const decrease = ((lastWeekCompleted - thisWeekCompleted) / lastWeekCompleted) * 100;
    const signalScore = Math.min(20, Math.round(decrease / 5));
    score += signalScore;
    if (signalScore > 5) signals.push('Decreasing task completion rate');
  }

  const thisWeekAbandoned = thisWeekEvents.filter(
    (e) => e.type === 'FOCUS_ABANDONED'
  ).length;
  const lastWeekAbandoned = lastWeekEvents.filter(
    (e) => e.type === 'FOCUS_ABANDONED'
  ).length;
  if (thisWeekAbandoned > lastWeekAbandoned) {
    const increase = thisWeekAbandoned - lastWeekAbandoned;
    const signalScore = Math.min(20, increase * 4);
    score += signalScore;
    if (signalScore > 3) signals.push('Increasing focus session abandonments');
  }

  const thisWeekSnoozed = thisWeekEvents.filter((e) => e.type === 'TASK_SNOOZED').length;
  const lastWeekSnoozed = lastWeekEvents.filter((e) => e.type === 'TASK_SNOOZED').length;
  if (thisWeekSnoozed > lastWeekSnoozed) {
    const increase = thisWeekSnoozed - lastWeekSnoozed;
    const signalScore = Math.min(20, increase * 4);
    score += signalScore;
    if (signalScore > 3) signals.push('Increasing task snoozing');
  }

  const recentSessions = focusSessions.filter((s) =>
    isInRange(s.startedAt, twoWeeksAgo, nowStr)
  );
  const thisWeekSessions = recentSessions.filter((s) =>
    isInRange(s.startedAt, thisWeekStart, nowStr)
  );
  const lastWeekSessions = recentSessions.filter((s) => {
    const started = toDateOnly(s.startedAt);
    return started >= lastWeekStart && started <= addDays(lastWeekStart, 6);
  });

  const thisWeekAvgDuration =
    thisWeekSessions.length > 0
      ? thisWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
        thisWeekSessions.length
      : 0;
  const lastWeekAvgDuration =
    lastWeekSessions.length > 0
      ? lastWeekSessions.reduce((sum, s) => sum + (s.duration || 0), 0) /
        lastWeekSessions.length
      : 0;
  if (lastWeekAvgDuration > 0 && thisWeekAvgDuration < lastWeekAvgDuration) {
    const decrease =
      ((lastWeekAvgDuration - thisWeekAvgDuration) / lastWeekAvgDuration) * 100;
    const signalScore = Math.min(20, Math.round(decrease / 5));
    score += signalScore;
    if (signalScore > 3) signals.push('Decreasing focus session duration');
  }

  const allEventDays = new Set(recentEvents.map((e) => toDateOnly(e.createdAt)));
  let maxGap = 0;
  for (let i = 0; i < 14; i++) {
    const day = addDays(twoWeeksAgo, i);
    if (!allEventDays.has(day)) {
      maxGap++;
    } else {
      break;
    }
  }
  if (maxGap >= 3) {
    const signalScore = Math.min(20, maxGap * 3);
    score += signalScore;
    if (signalScore > 5) signals.push(`${maxGap}-day inactivity gap detected`);
  }

  score = Math.min(100, Math.max(0, score));

  let level: BurnoutRisk['level'] = 'low';
  if (score > 75) level = 'critical';
  else if (score > 50) level = 'high';
  else if (score > 25) level = 'moderate';

  let trend: BurnoutRisk['trend'] = 'stable';
  const thisWeekScore = thisWeekEvents.length;
  const lastWeekScore = lastWeekEvents.length;
  if (thisWeekScore > lastWeekScore * 1.2) trend = 'improving';
  else if (thisWeekScore < lastWeekScore * 0.8) trend = 'worsening';

  return { level, score, signals, trend };
}

export function calculateProcrastinationProfile(
  tasks: Task[],
  events: BehaviorEvent[]
): ProcrastinationProfile {
  const now = new Date();
  const nowStr = now.toISOString();
  const weekAgo = addDays(nowStr, -7);

  const recentSnoozeEvents = events.filter(
    (e) => e.type === 'TASK_SNOOZED' && isInRange(e.createdAt, weekAgo, nowStr)
  );
  const snoozeCount = recentSnoozeEvents.length;

  const recentUpdateEvents = events.filter(
    (e) => e.type === 'TASK_UPDATED' && isInRange(e.createdAt, weekAgo, nowStr)
  );
  const tasksUpdatedMultipleTimes = new Map<string, number>();
  for (const event of recentUpdateEvents) {
    if (event.taskId) {
      tasksUpdatedMultipleTimes.set(
        event.taskId,
        (tasksUpdatedMultipleTimes.get(event.taskId) || 0) + 1
      );
    }
  }
  const rescheduleCount = Array.from(tasksUpdatedMultipleTimes.values()).filter(
    (count) => count >= 2
  ).length;

  const rawScore = snoozeCount * 10 + rescheduleCount * 15;
  const score = Math.min(100, Math.max(0, rawScore));

  const hourCounts = new Map<number, number>();
  for (const event of recentSnoozeEvents) {
    const hour = getHour(event.createdAt);
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  }
  let peakHour = 9;
  let peakCount = 0;
  for (const [hour, count] of hourCounts) {
    if (count > peakCount) {
      peakHour = hour;
      peakCount = count;
    }
  }
  const peakProcrastinationTime =
    peakCount > 0
      ? `${peakHour.toString().padStart(2, '0')}:00`
      : 'No data';

  const patterns: string[] = [];
  if (snoozeCount > 0) {
    const dayCounts = new Map<string, number>();
    for (const event of recentSnoozeEvents) {
      const day = new Date(event.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
      dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
    }
    for (const [day, count] of dayCounts) {
      if (count >= 2) patterns.push(`Snoozes tasks most on ${day}s`);
    }
  }
  if (rescheduleCount > 0) {
    patterns.push(`Reschedules tasks ${rescheduleCount}x this week`);
  }
  if (recentSnoozeEvents.length === 0 && rescheduleCount === 0) {
    patterns.push('No procrastination patterns detected');
  }

  const commonReasons: string[] = [];
  if (snoozeCount > 2) commonReasons.push('Frequent task snoozing');
  if (rescheduleCount > 1) commonReasons.push('Repeated task rescheduling');
  const lateSnoozes = recentSnoozeEvents.filter((e) => {
    const hour = getHour(e.createdAt);
    return hour >= 17 || hour < 6;
  });
  if (lateSnoozes.length > 1) commonReasons.push('Late-day procrastination');
  if (commonReasons.length === 0) commonReasons.push('None identified');

  const frequency = Math.round((snoozeCount / 7) * 10) / 10;

  return { score, patterns, peakProcrastinationTime, commonReasons, frequency };
}
