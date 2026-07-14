import { apiClient, endpoints } from '@/api';

export interface Notification {
  id: string;
  userId: string;
  type: 'REMINDER' | 'FOCUS_PROMPT' | 'WEEKLY_REVIEW' | 'GOAL_UPDATE' | 'INSIGHT_GENERATED';
  title: string;
  body: string;
  data?: string;
  read: boolean;
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationPreferences {
  userId: string;
  notificationDensity: string;
  focusReminders: boolean;
  dailyBrief: boolean;
  weeklyReview: boolean;
  goalUpdates: boolean;
}

export const notificationService = {
  list: async (params?: { type?: string; read?: boolean }): Promise<Notification[]> => {
    const response = await apiClient.get(endpoints.notifications.list, { params });
    return response.data.data;
  },

  detail: async (id: string): Promise<Notification> => {
    const response = await apiClient.get(endpoints.notifications.detail(id));
    return response.data.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await apiClient.patch(endpoints.notifications.markRead(id));
    return response.data.data;
  },

  markAllAsRead: async (): Promise<{ count: number }> => {
    const response = await apiClient.patch(endpoints.notifications.markAllRead);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.notifications.detail(id));
  },

  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await apiClient.get(endpoints.notifications.unreadCount);
    return response.data.data;
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    const response = await apiClient.get(endpoints.notifications.preferences);
    return response.data.data;
  },
};
