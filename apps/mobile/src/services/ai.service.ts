import { apiClient, endpoints } from '@/api';

export interface AIRecommendation {
  id: string;
  sourceType: string;
  sourceId: string;
  kind: string;
  title: string;
  body: string;
  payload: Record<string, unknown>;
  acceptedAt: string | null;
  dismissedAt: string | null;
  createdAt: string;
}

export interface GoalFeasibility {
  feasible: boolean;
  reason: string;
  suggestions: string[];
}

export interface TaskBreakdown {
  title: string;
}

export interface SimplifiedTask {
  simplifiedTitle: string;
  firstStep: string;
  motivation: string;
}

export interface AIUsageSummary {
  dailyRequests: number;
  monthlyRequests: number;
  totalTokens: number;
  estimatedCost: number;
}

export interface AIUsageByFeature {
  feature: string;
  requests: number;
  tokens: number;
  percentage: number;
}

export interface AIUsageByDay {
  date: string;
  requests: number;
  tokens: number;
}

export const aiService = {
  getRecommendations: async (): Promise<AIRecommendation[]> => {
    try {
      const response = await apiClient.get(endpoints.ai.recommendations);
      return response.data ?? [];
    } catch (error) {
      console.warn('Failed to fetch AI recommendations:', error);
      return [];
    }
  },

  generateRecommendation: async (): Promise<AIRecommendation | null> => {
    try {
      const response = await apiClient.post(endpoints.ai.generateRecommendation);
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to generate AI recommendation:', error);
      return null;
    }
  },

  acceptRecommendation: async (id: string): Promise<void> => {
    try {
      await apiClient.post(endpoints.ai.acceptRecommendation(id));
    } catch (error) {
      console.warn('Failed to accept AI recommendation:', error);
    }
  },

  dismissRecommendation: async (id: string): Promise<void> => {
    try {
      await apiClient.post(endpoints.ai.dismissRecommendation(id));
    } catch (error) {
      console.warn('Failed to dismiss AI recommendation:', error);
    }
  },

  getDailyBrief: async (): Promise<any> => {
    try {
      const response = await apiClient.get(endpoints.ai.dailyBrief);
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to get daily brief:', error);
      return null;
    }
  },

  breakdownTask: async (taskId: string): Promise<TaskBreakdown[] | null> => {
    try {
      const response = await apiClient.post(endpoints.ai.breakdownTask(taskId));
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to breakdown task:', error);
      return null;
    }
  },

  stuckAnalysis: async (feeling: string, taskId?: string): Promise<any> => {
    try {
      const response = await apiClient.post(endpoints.ai.stuckAnalysis, { feeling, taskId });
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to analyze stuck feeling:', error);
      return null;
    }
  },

  getWeeklyReview: async (): Promise<any> => {
    try {
      const response = await apiClient.get(endpoints.ai.weeklyReview);
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to get weekly review:', error);
      return null;
    }
  },

  getGoalRecovery: async (goalId: string): Promise<any> => {
    try {
      const response = await apiClient.post(endpoints.ai.goalRecovery(goalId));
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to get goal recovery:', error);
      return null;
    }
  },

  getStatus: async (): Promise<{ configured: boolean }> => {
    try {
      const response = await apiClient.get(endpoints.ai.status);
      return response.data ?? { configured: false };
    } catch (error) {
      console.warn('Failed to get AI status:', error);
      return { configured: false };
    }
  },

  getUsageSummary: async (): Promise<AIUsageSummary | null> => {
    try {
      const response = await apiClient.get(endpoints.ai.usageSummary);
      return response.data ?? null;
    } catch (error) {
      console.warn('Failed to get AI usage summary:', error);
      return null;
    }
  },

  getUsageByFeature: async (): Promise<AIUsageByFeature[]> => {
    try {
      const response = await apiClient.get(endpoints.ai.usageByFeature);
      return response.data ?? [];
    } catch (error) {
      console.warn('Failed to get AI usage by feature:', error);
      return [];
    }
  },

  getUsageByDay: async (days?: number): Promise<AIUsageByDay[]> => {
    try {
      const params = days ? { days } : {};
      const response = await apiClient.get(endpoints.ai.usageByDay, { params });
      return response.data ?? [];
    } catch (error) {
      console.warn('Failed to get AI usage by day:', error);
      return [];
    }
  },
};
