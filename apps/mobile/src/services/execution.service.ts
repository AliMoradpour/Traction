import { apiClient, endpoints } from '@/api';

export interface ReadinessScore {
  score: number;
  factors: string[];
  explanation: string;
}

export interface ResistanceDetection {
  score: number;
  patterns: string[];
  suggestions: string[];
}

export interface MomentumMetrics {
  currentStreak: number;
  executionStreak: number;
  recoveryStreak: number;
  weeklyMomentum: number;
  monthlyMomentum: number;
  trend: 'improving' | 'stable' | 'declining';
}

export interface ExecutionStats {
  tasksCompleted: { allTime: number; thisWeek: number; today: number };
  focusTime: { allTime: number; thisWeek: number; today: number };
  averageFocusDuration: number;
  completionReliability: number;
  planningAccuracy: number;
}

interface ExecutionStatsResponse {
  totalTasksCompleted: number;
  weeklyTasksCompleted: number;
  dailyTasksCompleted: number;
  totalFocusTime: number;
  weeklyFocusTime: number;
  dailyFocusTime: number;
  averageSessionDuration: number;
  completionReliability: number;
  planningAccuracy: number;
}

export const executionService = {
  getReadiness: async (): Promise<ReadinessScore> => {
    const response = await apiClient.get(endpoints.execution.readiness);
    return response.data;
  },

  getResistance: async (): Promise<ResistanceDetection> => {
    const response = await apiClient.get(endpoints.execution.resistance);
    return response.data;
  },

  getMomentum: async (): Promise<MomentumMetrics> => {
    const response = await apiClient.get(endpoints.execution.momentum);
    return response.data;
  },

  getStats: async (): Promise<ExecutionStats> => {
    const response = await apiClient.get<ExecutionStatsResponse>(endpoints.execution.stats);
    const s = response.data;
    // The API returns flat totals (focus time in minutes, average session in seconds).
    return {
      tasksCompleted: {
        allTime: s.totalTasksCompleted,
        thisWeek: s.weeklyTasksCompleted,
        today: s.dailyTasksCompleted,
      },
      focusTime: { allTime: s.totalFocusTime, thisWeek: s.weeklyFocusTime, today: s.dailyFocusTime },
      averageFocusDuration: Math.round(s.averageSessionDuration / 60),
      completionReliability: s.completionReliability,
      planningAccuracy: s.planningAccuracy,
    };
  },
};
