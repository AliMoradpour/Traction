import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { insightService } from '@/services/insight.service';

export const insightKeys = {
  all: ['insights'] as const,
  lists: () => [...insightKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...insightKeys.lists(), params] as const,
  details: () => [...insightKeys.all, 'detail'] as const,
  detail: (id: string) => [...insightKeys.details(), id] as const,
  dailyBrief: () => [...insightKeys.all, 'dailyBrief'] as const,
  behavioralAwareness: () => [...insightKeys.all, 'behavioralAwareness'] as const,
  weeklyReview: () => [...insightKeys.all, 'weeklyReview'] as const,
};

export function useInsights(params?: { type?: string; goalId?: string; read?: boolean; dismissed?: boolean }) {
  return useQuery({
    queryKey: insightKeys.list(params),
    queryFn: () => insightService.list(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useInsight(id: string) {
  return useQuery({
    queryKey: insightKeys.detail(id),
    queryFn: () => insightService.detail(id),
    enabled: !!id,
  });
}

export function useMarkInsightAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: insightKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() });
    },
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightService.dismiss(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: insightKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() });
    },
  });
}

export function useMarkAllInsightsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => insightService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() });
    },
  });
}

export function useDeleteInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: insightKeys.lists() });
    },
  });
}

export function useDailyBrief() {
  return useQuery({
    queryKey: insightKeys.dailyBrief(),
    queryFn: () => insightService.getDailyBrief(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useBehavioralAwareness() {
  return useQuery({
    queryKey: insightKeys.behavioralAwareness(),
    queryFn: () => insightService.getBehavioralAwareness(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useWeeklyReview() {
  return useQuery({
    queryKey: insightKeys.weeklyReview(),
    queryFn: () => insightService.getWeeklyReview(),
    staleTime: 10 * 60 * 1000,
  });
}
