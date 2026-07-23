import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';
import { taskService, focusService, behaviorService, type BehaviorEvent } from '@/services';
import {
  calculateDailyMetrics,
  calculateWeeklyMetrics,
  calculateBehaviorIndicators,
  calculateBurnoutRisk,
  calculateProcrastinationProfile,
  type DailyMetrics,
  type WeeklyMetrics,
  type BehaviorIndicators,
  type BurnoutRisk,
  type ProcrastinationProfile,
  type BehaviorTimeline,
} from '@/lib/behaviorEngine';

function startOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d.toISOString().slice(0, 10);
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useBehaviorTimeline(days = 30) {
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list({ _timeline: true }),
    queryFn: () => taskService.list(),
    ...cacheConfig.tasks,
  });

  const focusQuery = useQuery({
    queryKey: queryKeys.focus.list({ _timeline: true }),
    queryFn: () => focusService.list(),
    ...cacheConfig.focus,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.behavior.list({ _timeline: true }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });

  const isLoading = tasksQuery.isLoading || focusQuery.isLoading || eventsQuery.isLoading;
  const refetch = useCallback(() => {
    tasksQuery.refetch();
    focusQuery.refetch();
    eventsQuery.refetch();
  }, [tasksQuery, focusQuery, eventsQuery]);
  const tasks = tasksQuery.data ?? [];
  const focusSessions = focusQuery.data ?? [];
  const events = eventsQuery.data ?? [];

  const dailyBreakdown: DailyMetrics[] = [];
  for (let i = 0; i < days; i++) {
    const day = addDays(todayStr(), -(days - 1 - i));
    dailyBreakdown.push(calculateDailyMetrics(day, tasks, events, focusSessions));
  }

  const weeklyBreakdown: WeeklyMetrics[] = [];
  const weeks = Math.ceil(days / 7);
  for (let i = 0; i < weeks; i++) {
    const weekStart = addDays(todayStr(), -(days - 1) - i * 7);
    weeklyBreakdown.push(
      calculateWeeklyMetrics(startOfWeek(weekStart), tasks, events, focusSessions)
    );
  }

  const timeline: BehaviorTimeline = {
    events,
    dailyBreakdown,
    weeklyBreakdown,
  };

  return { data: timeline, isLoading, refetch };
}

export function useDailyMetrics(date?: string) {
  const targetDate = date ?? todayStr();

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list({ _dailyMetrics: targetDate }),
    queryFn: () => taskService.list(),
    ...cacheConfig.tasks,
  });

  const focusQuery = useQuery({
    queryKey: queryKeys.focus.list({ _dailyMetrics: targetDate }),
    queryFn: () => focusService.list(),
    ...cacheConfig.focus,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.behavior.list({ _dailyMetrics: targetDate }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });

  const isLoading = tasksQuery.isLoading || focusQuery.isLoading || eventsQuery.isLoading;
  const refetch = useCallback(() => {
    tasksQuery.refetch();
    focusQuery.refetch();
    eventsQuery.refetch();
  }, [tasksQuery, focusQuery, eventsQuery]);

  const metrics: DailyMetrics = calculateDailyMetrics(
    targetDate,
    tasksQuery.data ?? [],
    eventsQuery.data ?? [],
    focusQuery.data ?? []
  );

  return { data: metrics, isLoading, refetch };
}

export function useWeeklyMetrics(weekStart?: string) {
  const targetWeek = weekStart ?? startOfWeek(todayStr());

  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list({ _weeklyMetrics: targetWeek }),
    queryFn: () => taskService.list(),
    ...cacheConfig.tasks,
  });

  const focusQuery = useQuery({
    queryKey: queryKeys.focus.list({ _weeklyMetrics: targetWeek }),
    queryFn: () => focusService.list(),
    ...cacheConfig.focus,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.behavior.list({ _weeklyMetrics: targetWeek }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });

  const isLoading = tasksQuery.isLoading || focusQuery.isLoading || eventsQuery.isLoading;
  const refetch = useCallback(() => {
    tasksQuery.refetch();
    focusQuery.refetch();
    eventsQuery.refetch();
  }, [tasksQuery, focusQuery, eventsQuery]);

  const metrics: WeeklyMetrics = calculateWeeklyMetrics(
    targetWeek,
    tasksQuery.data ?? [],
    eventsQuery.data ?? [],
    focusQuery.data ?? []
  );

  return { data: metrics, isLoading, refetch };
}

export function useBehaviorIndicators(days = 30) {
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list({ _indicators: days }),
    queryFn: () => taskService.list(),
    ...cacheConfig.tasks,
  });

  const focusQuery = useQuery({
    queryKey: queryKeys.focus.list({ _indicators: days }),
    queryFn: () => focusService.list(),
    ...cacheConfig.focus,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.behavior.list({ _indicators: days }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });

  const isLoading = tasksQuery.isLoading || focusQuery.isLoading || eventsQuery.isLoading;
  const refetch = useCallback(() => {
    tasksQuery.refetch();
    focusQuery.refetch();
    eventsQuery.refetch();
  }, [tasksQuery, focusQuery, eventsQuery]);

  const indicators: BehaviorIndicators = calculateBehaviorIndicators(
    tasksQuery.data ?? [],
    eventsQuery.data ?? [],
    focusQuery.data ?? [],
    days
  );

  return { data: indicators, isLoading, refetch };
}

export function useBurnoutRisk() {
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list({ _burnout: true }),
    queryFn: () => taskService.list(),
    ...cacheConfig.tasks,
  });

  const focusQuery = useQuery({
    queryKey: queryKeys.focus.list({ _burnout: true }),
    queryFn: () => focusService.list(),
    ...cacheConfig.focus,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.behavior.list({ _burnout: true }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });

  const isLoading = tasksQuery.isLoading || focusQuery.isLoading || eventsQuery.isLoading;
  const refetch = useCallback(() => {
    tasksQuery.refetch();
    focusQuery.refetch();
    eventsQuery.refetch();
  }, [tasksQuery, focusQuery, eventsQuery]);

  const risk: BurnoutRisk = calculateBurnoutRisk(
    tasksQuery.data ?? [],
    eventsQuery.data ?? [],
    focusQuery.data ?? []
  );

  return { data: risk, isLoading, refetch };
}

export function useProcrastinationProfile() {
  const tasksQuery = useQuery({
    queryKey: queryKeys.tasks.list({ _procrastination: true }),
    queryFn: () => taskService.list(),
    ...cacheConfig.tasks,
  });

  const eventsQuery = useQuery({
    queryKey: queryKeys.behavior.list({ _procrastination: true }),
    queryFn: () => behaviorService.list(),
    ...cacheConfig.behavior,
  });

  const isLoading = tasksQuery.isLoading || eventsQuery.isLoading;
  const refetch = useCallback(() => {
    tasksQuery.refetch();
    eventsQuery.refetch();
  }, [tasksQuery, eventsQuery]);

  const profile: ProcrastinationProfile = calculateProcrastinationProfile(
    tasksQuery.data ?? [],
    eventsQuery.data ?? []
  );

  return { data: profile, isLoading, refetch };
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
