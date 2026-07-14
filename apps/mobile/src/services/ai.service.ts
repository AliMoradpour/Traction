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

export const aiService = {
  getRecommendations: async (): Promise<AIRecommendation[]> => {
    try {
      const response = await apiClient.get(endpoints.ai.recommendations);
      return response.data.data ?? [];
    } catch (error) {
      console.warn('Failed to fetch AI recommendations:', error);
      return [];
    }
  },

  generateRecommendation: async (): Promise<AIRecommendation | null> => {
    try {
      const response = await apiClient.post(endpoints.ai.generateRecommendation);
      return response.data.data ?? null;
    } catch (error) {
      console.warn('Failed to generate AI recommendation:', error);
      return null;
    }
  },

  acceptRecommendation: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`${endpoints.ai.recommendations}/${id}/accept`);
    } catch (error) {
      console.warn('Failed to accept AI recommendation:', error);
    }
  },

  dismissRecommendation: async (id: string): Promise<void> => {
    try {
      await apiClient.post(`${endpoints.ai.recommendations}/${id}/dismiss`);
    } catch (error) {
      console.warn('Failed to dismiss AI recommendation:', error);
    }
  },

  analyzeGoalFeasibility: async (title: string, deadline?: string): Promise<GoalFeasibility | null> => {
    try {
      const response = await apiClient.post(endpoints.ai.analyzeGoal, { title, deadline });
      return response.data.data ?? null;
    } catch (error) {
      console.warn('Failed to analyze goal feasibility:', error);
      return null;
    }
  },

  breakdownTask: async (title: string, description?: string): Promise<TaskBreakdown[] | null> => {
    try {
      const response = await apiClient.post(endpoints.ai.breakdownTask, { title, description });
      return response.data.data ?? null;
    } catch (error) {
      console.warn('Failed to breakdown task:', error);
      return null;
    }
  },

  simplifyTask: async (title: string, resistanceLevel: number): Promise<SimplifiedTask | null> => {
    try {
      const response = await apiClient.post(endpoints.ai.simplifyTask, { title, resistanceLevel });
      return response.data.data ?? null;
    } catch (error) {
      console.warn('Failed to simplify task:', error);
      return null;
    }
  },

  getStatus: async (): Promise<{ configured: boolean }> => {
    try {
      const response = await apiClient.get(endpoints.ai.status);
      return response.data.data ?? { configured: false };
    } catch (error) {
      console.warn('Failed to get AI status:', error);
      return { configured: false };
    }
  },
};
