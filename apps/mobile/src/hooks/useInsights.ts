import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { insightService } from '@/services/insight.service';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';

export function useInsights(params?: { type?: string; goalId?: string; read?: boolean; dismissed?: boolean }) {
  return useQuery({
    queryKey: queryKeys.insights.list(params),
    queryFn: () => insightService.list(params),
    ...cacheConfig.insights,
  });
}

export function useInsight(id: string) {
  return useQuery({
    queryKey: queryKeys.insights.detail(id),
    queryFn: () => insightService.detail(id),
    enabled: !!id,
    ...cacheConfig.insights,
  });
}

export function useMarkInsightAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightService.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.lists() });
    },
  });
}

export function useDismissInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightService.dismiss(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.lists() });
    },
  });
}

export function useMarkAllInsightsAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => insightService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.lists() });
    },
  });
}

export function useDeleteInsight() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => insightService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.insights.lists() });
    },
  });
}

export function useDailyBrief() {
  return useQuery({
    queryKey: queryKeys.insights.dailyBrief(),
    queryFn: () => insightService.getDailyBrief(),
    ...cacheConfig.insights,
  });
}

export function useBehavioralAwareness() {
  return useQuery({
    queryKey: queryKeys.insights.behavioralAwareness(),
    queryFn: () => insightService.getBehavioralAwareness(),
    ...cacheConfig.insights,
  });
}

export function useWeeklyReview() {
  return useQuery({
    queryKey: queryKeys.insights.weeklyReview(),
    queryFn: () => insightService.getWeeklyReview(),
    ...cacheConfig.insights,
  });
}
