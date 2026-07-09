export const APP_NAME = 'Traction';

export const API_TIMEOUT = 15000;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  COLOR_SCHEME: 'colorScheme',
} as const;

export const QUERY_KEYS = {
  AUTH: ['auth'] as const,
  USER: ['user'] as const,
  TASKS: ['tasks'] as const,
  TASK_DETAIL: (id: string) => ['tasks', id] as const,
  GOALS: ['goals'] as const,
  GOAL_DETAIL: (id: string) => ['goals', id] as const,
  INSIGHTS: ['insights'] as const,
  DAILY_BRIEF: ['insights', 'daily-behavioral-awareness'] as const,
  WEEKLY_REVIEW: ['insights', 'weekly-review'] as const,
  AI_RECOMMENDATIONS: ['ai', 'recommendations'] as const,
} as const;

export const TAB_NAMES = {
  TODAY: 'today',
  GOALS: 'goals',
  INSIGHTS: 'insights',
  PROFILE: 'profile',
} as const;
