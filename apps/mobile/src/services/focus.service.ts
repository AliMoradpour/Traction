import { apiClient, endpoints } from '@/api';

export interface FocusSession {
  id: string;
  userId: string;
  taskId?: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export const focusService = {
  start: async (taskId?: string): Promise<FocusSession> => {
    const response = await apiClient.post(endpoints.focus.start, { taskId });
    return response.data.data;
  },

  pause: async (id: string): Promise<FocusSession> => {
    const response = await apiClient.post(endpoints.focus.pause(id));
    return response.data.data;
  },

  resume: async (id: string): Promise<FocusSession> => {
    const response = await apiClient.post(endpoints.focus.resume(id));
    return response.data.data;
  },

  complete: async (id: string): Promise<FocusSession> => {
    const response = await apiClient.post(endpoints.focus.complete(id));
    return response.data.data;
  },

  cancel: async (id: string): Promise<FocusSession> => {
    const response = await apiClient.post(endpoints.focus.cancel(id));
    return response.data.data;
  },

  getActive: async (): Promise<FocusSession | null> => {
    const response = await apiClient.get(endpoints.focus.active);
    return response.data.data;
  },

  list: async (params?: { status?: string; taskId?: string }): Promise<FocusSession[]> => {
    const response = await apiClient.get(endpoints.focus.list, { params });
    return response.data.data;
  },

  detail: async (id: string): Promise<FocusSession> => {
    const response = await apiClient.get(endpoints.focus.detail(id));
    return response.data.data;
  },
};
