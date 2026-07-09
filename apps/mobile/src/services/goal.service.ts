import { apiClient, endpoints } from '@/api';

export interface Goal {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'completed' | 'paused' | 'archived';
  targetDate: string | null;
  progressPercent: number;
  riskLevel: 'low' | 'medium' | 'high';
  velocity: number;
  createdAt: string;
  updatedAt: string;
}

export interface GoalMilestone {
  id: string;
  goalId: string;
  title: string;
  status: 'pending' | 'completed';
  dueDate: string | null;
  order: number;
}

export interface GoalProjection {
  riskLevel: 'low' | 'medium' | 'high';
  forecast: number;
  timeline: string;
  alternativeScenario: string;
}

export const goalService = {
  list: async (): Promise<Goal[]> => {
    const response = await apiClient.get(endpoints.goals.list);
    return response.data.data;
  },

  detail: async (id: string): Promise<Goal> => {
    const response = await apiClient.get(endpoints.goals.detail(id));
    return response.data.data;
  },

  feasibility: async (goalId: string): Promise<GoalProjection> => {
    const response = await apiClient.get(endpoints.goals.feasibility(goalId));
    return response.data.data;
  },

  projection: async (goalId: string): Promise<GoalProjection> => {
    const response = await apiClient.get(endpoints.goals.projection(goalId));
    return response.data.data;
  },
};
