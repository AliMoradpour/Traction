import { apiClient, endpoints } from '@/api';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'inProgress' | 'completed' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  frictionScore: number;
  durationMinutes: number;
  scheduledFor: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskStep {
  id: string;
  taskId: string;
  title: string;
  description: string;
  durationMinutes: number;
  status: 'pending' | 'inProgress' | 'completed';
  order: number;
}

export const taskService = {
  list: async (): Promise<Task[]> => {
    const response = await apiClient.get(endpoints.tasks.list);
    return response.data.data;
  },

  detail: async (id: string): Promise<Task> => {
    const response = await apiClient.get(endpoints.tasks.detail(id));
    return response.data.data;
  },

  steps: async (taskId: string): Promise<TaskStep[]> => {
    const response = await apiClient.get(endpoints.tasks.steps(taskId));
    return response.data.data;
  },

  simplify: async (taskId: string): Promise<TaskStep[]> => {
    const response = await apiClient.post(endpoints.tasks.simplify(taskId));
    return response.data.data;
  },
};
