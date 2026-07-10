import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification.service';

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...notificationKeys.lists(), params] as const,
  details: () => [...notificationKeys.all, 'detail'] as const,
  detail: (id: string) => [...notificationKeys.details(), id] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
  preferences: () => [...notificationKeys.all, 'preferences'] as const,
};

export function useNotifications(params?: { type?: string; read?: boolean }) {
  return useQuery({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.list(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useNotification(id: string) {
  return useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.detail(id),
    enabled: !!id,
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useDeleteNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
    },
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useNotificationPreferences() {
  return useQuery({
    queryKey: notificationKeys.preferences(),
    queryFn: () => notificationService.getPreferences(),
    staleTime: 5 * 60 * 1000,
  });
}
