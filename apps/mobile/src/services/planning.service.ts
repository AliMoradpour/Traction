import { apiClient } from '@/api';

export interface MonthPlan {
  month: string; // "YYYY-MM"
  focuses: string[];
  note: string | null;
  updatedAt: string | null;
}

export interface MonthlyReview {
  month: string;
  stats: {
    planned: number;
    completed: number;
    completionRate: number;
    focusMinutes: number;
    activeDays: number;
  };
  focuses: string[];
  summary: string;
  wins: string[];
  struggles: string[];
  patterns: string[];
  nextMonth: string[];
  suggestedFocuses: string[];
  aiGenerated: boolean;
  generatedAt: string;
}

export const planningService = {
  getMonthPlan: async (month: string): Promise<MonthPlan> => {
    const response = await apiClient.get(`/planning/month/${month}`);
    return response.data;
  },

  updateMonthPlan: async (month: string, data: { focuses?: string[]; note?: string | null }): Promise<MonthPlan> => {
    const response = await apiClient.put(`/planning/month/${month}`, data);
    return response.data;
  },

  getMonthlyReview: async (month: string): Promise<MonthlyReview> => {
    const response = await apiClient.get('/ai/monthly-review', { params: { month } });
    return response.data;
  },
};
