import { apiClient, endpoints } from '@/api';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  duration?: number;
  friction?: number;
  energy: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledAt?: string;
  dueAt?: string;
  completedAt?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  goalId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  duration?: number;
  friction?: number;
  energy?: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledAt?: string;
  dueAt?: string;
  goalId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  duration?: number;
  friction?: number;
  energy?: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduledAt?: string;
  dueAt?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED' | 'CANCELLED';
  goalId?: string;
}

export interface TaskStep {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  status: 'pending' | 'inProgress' | 'completed';
  order: number;
}

export const taskService = {
  list: async (params?: { status?: string; category?: string; scheduledDate?: string; goalId?: string }): Promise<Task[]> => {
    const response = await apiClient.get(endpoints.tasks.list, { params });
    return response.data.data;
  },

  detail: async (id: string): Promise<Task> => {
    const response = await apiClient.get(endpoints.tasks.detail(id));
    return response.data.data;
  },

  create: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await apiClient.post(endpoints.tasks.list, data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await apiClient.patch(endpoints.tasks.detail(id), data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.tasks.detail(id));
  },

  complete: async (id: string): Promise<Task> => {
    const response = await apiClient.post(endpoints.tasks.complete(id));
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

  focusSessions: async (taskId: string): Promise<any[]> => {
    const response = await apiClient.get(endpoints.tasks.focusSessions(taskId));
    return response.data.data;
  },

  byDate: async (date: string): Promise<Task[]> => {
    const response = await apiClient.get(endpoints.tasks.byDate(date));
    return response.data.data;
  },
};
