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

export const executionService = {
  getReadiness: async (): Promise<ReadinessScore> => {
    const response = await apiClient.get(endpoints.execution.readiness);
    return response.data.data;
  },

  getResistance: async (): Promise<ResistanceDetection> => {
    const response = await apiClient.get(endpoints.execution.resistance);
    return response.data.data;
  },

  getMomentum: async (): Promise<MomentumMetrics> => {
    const response = await apiClient.get(endpoints.execution.momentum);
    return response.data.data;
  },

  getStats: async (): Promise<ExecutionStats> => {
    const response = await apiClient.get(endpoints.execution.stats);
    return response.data.data;
  },
};
