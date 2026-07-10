import { apiClient, endpoints } from '@/api';

export interface Insight {
  id: string;
  userId: string;
  goalId?: string;
  type: 'FOCUS_PATTERN' | 'PRODUCTIVITY_PATTERN' | 'FRICTION_TREND' | 'WEEKLY_SUMMARY' | 'BEHAVIORAL_AWARENESS' | 'AI_RECOMMENDATION';
  title: string;
  content: string;
  data?: string;
  generatedBy?: string;
  confidence?: number;
  read: boolean;
  dismissed: boolean;
  createdAt: string;
  updatedAt: string;
}

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
  list: async (params?: { type?: string; goalId?: string; read?: boolean; dismissed?: boolean }): Promise<Insight[]> => {
    const response = await apiClient.get(endpoints.insights.list, { params });
    return response.data.data;
  },

  detail: async (id: string): Promise<Insight> => {
    const response = await apiClient.get(endpoints.insights.detail(id));
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<Insight> => {
    const response = await apiClient.patch(endpoints.insights.markRead(id));
    return response.data.data;
  },

  dismiss: async (id: string): Promise<Insight> => {
    const response = await apiClient.patch(endpoints.insights.dismiss(id));
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await apiClient.patch(endpoints.insights.markAllRead);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.insights.detail(id));
  },

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
