import { apiClient, endpoints } from '@/api';

export interface BehaviorEvent {
  id: string;
  userId: string;
  taskId?: string;
  goalId?: string;
  focusSessionId?: string;
  type: 'TASK_COMPLETED' | 'TASK_SNOOZED' | 'TASK_SKIPPED' | 'TASK_CREATED' | 'TASK_UPDATED' | 'FOCUS_STARTED' | 'FOCUS_PAUSED' | 'FOCUS_COMPLETED' | 'FOCUS_ABANDONED' | 'WHY_AM_I_STUCK' | 'GOAL_CREATED' | 'GOAL_COMPLETED' | 'GOAL_UPDATED' | 'REFLECTION_COMPLETED' | 'WEEKLY_REVIEW_VIEWED';
  metadata?: string;
  value?: string;
  createdAt: string;
}

export interface BehaviorStats {
  totalEvents: number;
  eventsByType: { type: string; count: number }[];
  recentEvents: BehaviorEvent[];
}

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

export const behaviorService = {
  track: async (data: {
    type: BehaviorEvent['type'];
    taskId?: string;
    goalId?: string;
    focusSessionId?: string;
    metadata?: string;
    value?: string;
  }): Promise<BehaviorEvent> => {
    const response = await apiClient.post(endpoints.behavior.track, data);
    return response.data.data;
  },

  list: async (params?: {
    type?: string;
    taskId?: string;
    goalId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<BehaviorEvent[]> => {
    const response = await apiClient.get(endpoints.behavior.list, { params });
    return response.data.data;
  },

  detail: async (id: string): Promise<BehaviorEvent> => {
    const response = await apiClient.get(endpoints.behavior.detail(id));
    return response.data.data;
  },

  stats: async (): Promise<BehaviorStats> => {
    const response = await apiClient.get(endpoints.behavior.stats);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.behavior.detail(id));
  },

  dailyMetrics: async (date?: string): Promise<DailyMetrics> => {
    const response = await apiClient.get(endpoints.behavior.dailyMetrics(date));
    return response.data.data;
  },

  weeklyMetrics: async (weekStart?: string): Promise<WeeklyMetrics> => {
    const response = await apiClient.get(endpoints.behavior.weeklyMetrics(weekStart));
    return response.data.data;
  },

  indicators: async (days?: number): Promise<BehaviorIndicators> => {
    const response = await apiClient.get(endpoints.behavior.indicators(days));
    return response.data.data;
  },

  burnout: async (): Promise<BurnoutRisk> => {
    const response = await apiClient.get(endpoints.behavior.burnout);
    return response.data.data;
  },

  procrastination: async (): Promise<ProcrastinationProfile> => {
    const response = await apiClient.get(endpoints.behavior.procrastination);
    return response.data.data;
  },
};
