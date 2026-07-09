import { apiClient, endpoints } from '@/api';

export interface DailyBrief {
  focusWindow: string;
  frictionSummary: string;
  prioritizedTasks: string[];
  energyLevel: number;
  recommendations: string[];
}

export interface BehavioralAwareness {
  patterns: string[];
  triggers: string[];
  suggestedChanges: string[];
}

export interface WeeklyReview {
  wins: string[];
  commitments: string[];
  missedPatterns: string[];
  nextShift: string;
}

export const insightService = {
  getDailyBrief: async (): Promise<DailyBrief> => {
    const response = await apiClient.get(endpoints.insights.dailyBrief);
    return response.data.data;
  },

  getBehavioralAwareness: async (): Promise<BehavioralAwareness> => {
    const response = await apiClient.get(endpoints.insights.behavioralAwareness);
    return response.data.data;
  },

  getWeeklyReview: async (): Promise<WeeklyReview> => {
    const response = await apiClient.get(endpoints.insights.weeklyReview);
    return response.data.data;
  },
};
