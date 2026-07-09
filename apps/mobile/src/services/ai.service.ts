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

export const aiService = {
  getRecommendations: async (): Promise<AIRecommendation[]> => {
    const response = await apiClient.get(endpoints.ai.recommendations);
    return response.data.data;
  },

  acceptRecommendation: async (id: string): Promise<void> => {
    await apiClient.post(`${endpoints.ai.recommendations}/${id}/accept`);
  },

  dismissRecommendation: async (id: string): Promise<void> => {
    await apiClient.post(`${endpoints.ai.recommendations}/${id}/dismiss`);
  },
};
