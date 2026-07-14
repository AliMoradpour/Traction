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
};
