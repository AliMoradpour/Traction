import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';
import { behaviorService, type BehaviorEvent } from '@/services';

export function useBehaviorTimeline(days = 30) {
  return useQuery({
    queryKey: queryKeys.behavior.list({ _timeline: days }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });
}

export function useDailyMetrics(date?: string) {
  return useQuery({
    queryKey: queryKeys.behavior.list({ _dailyMetrics: date }),
    queryFn: () => behaviorService.dailyMetrics(date),
    ...cacheConfig.behavior,
  });
}

export function useWeeklyMetrics(weekStart?: string) {
  return useQuery({
    queryKey: queryKeys.behavior.list({ _weeklyMetrics: weekStart }),
    queryFn: () => behaviorService.weeklyMetrics(weekStart),
    ...cacheConfig.behavior,
  });
}

export function useBehaviorIndicators(days = 30) {
  return useQuery({
    queryKey: queryKeys.behavior.list({ _indicators: days }),
    queryFn: () => behaviorService.indicators(days),
    ...cacheConfig.behavior,
  });
}

export function useBurnoutRisk() {
  return useQuery({
    queryKey: queryKeys.behavior.list({ _burnout: true }),
    queryFn: () => behaviorService.burnout(),
    ...cacheConfig.behavior,
  });
}

export function useProcrastinationProfile() {
  return useQuery({
    queryKey: queryKeys.behavior.list({ _procrastination: true }),
    queryFn: () => behaviorService.procrastination(),
    ...cacheConfig.behavior,
  });
}

export function useTrackBehavior() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      type: BehaviorEvent['type'];
      taskId?: string;
      goalId?: string;
      focusSessionId?: string;
      metadata?: string;
      value?: string;
    }) => behaviorService.track(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.behavior.all });
    },
  });
}
