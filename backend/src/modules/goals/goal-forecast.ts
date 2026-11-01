const DAY_MS = 24 * 60 * 60 * 1000;

/** Days of history after which the observed pace is trusted as much as the prior. */
const PRIOR_WEIGHT_DAYS = 7;
const MIN_PROBABILITY = 0.05;
const MAX_PROBABILITY = 0.95;

export interface GoalForecastInput {
  progress: number; // 0-100
  startDate: Date;
  targetDate?: Date | null;
  completedAt?: Date | null;
}

export type ForecastConfidence = 'low' | 'medium' | 'high';
export type ForecastReadiness = 'low' | 'medium' | 'high';

export interface GoalForecast {
  progress: number;
  daysElapsed: number;
  /** Whole days until the target date; negative once it has passed. Null without a target. */
  daysRemaining: number | null;
  /** Observed progress per day since the goal started (percentage points). */
  currentPace: number;
  /** Progress per day needed from now on to hit the target. Null without a usable target. */
  requiredPace: number | null;
  /** Days still needed at the current pace. Null when there is no pace yet. */
  projectedDaysToFinish: number | null;
  projectedCompletionDate: string | null;
  /** Null when there is no target date to be on track for. */
  onTrack: boolean | null;
  /** 0-1 chance of finishing by the target date. Null without a target date. */
  probability: number | null;
  /** How much history the forecast rests on. */
  confidence: ForecastConfidence;
  readiness: ForecastReadiness;
  timeline: string;
  recommendation: string;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/**
 * Forecasts whether a goal will be finished on time, from its progress so far
 * and the time left. Pure: everything it needs is passed in, including `now`.
 */
export function computeGoalForecast(
  input: GoalForecastInput,
  now: Date = new Date(),
): GoalForecast {
  const progress = clamp(Math.round(input.progress ?? 0), 0, 100);
  const daysElapsed = Math.max(1, Math.floor((now.getTime() - input.startDate.getTime()) / DAY_MS));
  const daysRemaining = input.targetDate
    ? Math.ceil((input.targetDate.getTime() - now.getTime()) / DAY_MS)
    : null;

  const currentPace = progress / daysElapsed;
  const remaining = 100 - progress;
  const projectedDaysToFinish =
    progress >= 100 ? 0 : currentPace > 0 ? Math.ceil(remaining / currentPace) : null;
  const projectedCompletionDate =
    progress >= 100
      ? (input.completedAt ?? now).toISOString()
      : projectedDaysToFinish !== null
        ? new Date(now.getTime() + projectedDaysToFinish * DAY_MS).toISOString()
        : null;

  const confidence: ForecastConfidence =
    daysElapsed < 7 ? 'low' : daysElapsed < 21 ? 'medium' : 'high';

  const base = {
    progress,
    daysElapsed,
    daysRemaining,
    currentPace: round2(currentPace),
    projectedDaysToFinish,
    projectedCompletionDate,
    confidence,
  };

  if (progress >= 100) {
    return {
      ...base,
      requiredPace: 0,
      onTrack: true,
      probability: 1,
      readiness: 'high',
      timeline: 'Completed',
      recommendation: 'Goal complete. Archive it or set your next goal.',
    };
  }

  if (daysRemaining === null) {
    return {
      ...base,
      requiredPace: null,
      onTrack: null,
      probability: null,
      readiness: progress >= 75 ? 'high' : progress >= 40 ? 'medium' : 'low',
      timeline:
        projectedDaysToFinish !== null
          ? `No deadline set. At your current pace you'd finish in about ${plural(projectedDaysToFinish, 'day')}.`
          : 'No deadline set.',
      recommendation: 'Set a target date to get an on-time forecast.',
    };
  }

  if (daysRemaining <= 0) {
    const overdue = Math.abs(daysRemaining);
    return {
      ...base,
      requiredPace: null,
      onTrack: false,
      probability: MIN_PROBABILITY,
      readiness: 'low',
      timeline:
        overdue === 0
          ? 'The deadline is today.'
          : `The deadline passed ${plural(overdue, 'day')} ago.`,
      recommendation: 'Move the target date or cut the scope so the goal is realistic again.',
    };
  }

  const requiredPace = remaining / daysRemaining;
  const paceRatio = currentPace / requiredPace;
  // With little history the observed pace is noisy (a goal created today has
  // pace 0), so pull it toward "exactly on pace" until there's a week of data.
  const shrunkRatio =
    (paceRatio * daysElapsed + 1 * PRIOR_WEIGHT_DAYS) / (daysElapsed + PRIOR_WEIGHT_DAYS);
  // r²/(1+r²): 50% at exactly the required pace, 80% at double, 20% at half.
  const probability = round2(
    clamp(
      (shrunkRatio * shrunkRatio) / (1 + shrunkRatio * shrunkRatio),
      MIN_PROBABILITY,
      MAX_PROBABILITY,
    ),
  );
  const onTrack = paceRatio >= 1;
  const readiness: ForecastReadiness =
    probability >= 0.7 ? 'high' : probability >= 0.4 ? 'medium' : 'low';

  const left = `${plural(daysRemaining, 'day')} left`;
  const timeline =
    projectedDaysToFinish === null
      ? `${left}. No progress logged yet, so there's no pace to project from.`
      : projectedDaysToFinish <= daysRemaining
        ? `${left}. At your current pace you'd finish in about ${plural(projectedDaysToFinish, 'day')}, ${plural(daysRemaining - projectedDaysToFinish, 'day')} early.`
        : `${left}. At your current pace you'd need about ${plural(projectedDaysToFinish, 'day')}, ${plural(projectedDaysToFinish - daysRemaining, 'day')} past the deadline.`;

  const weekly = (perDay: number) => `${round1(perDay * 7)}% per week`;
  let recommendation: string;
  if (progress === 0) {
    recommendation = `Log your first progress. You'll need about ${weekly(requiredPace)} to finish on time.`;
  } else if (onTrack) {
    recommendation = `You're on pace. Keep up about ${weekly(requiredPace)} to finish on time.`;
  } else {
    const increase = Math.round((requiredPace / currentPace - 1) * 100);
    recommendation = `You're at ${weekly(currentPace)} and need ${weekly(requiredPace)}. Raise your effort by about ${increase}% or move the deadline.`;
  }

  return {
    ...base,
    requiredPace: round2(requiredPace),
    onTrack,
    probability,
    readiness,
    timeline,
    recommendation,
  };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
