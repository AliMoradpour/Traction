import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalService, CreateGoalRequest, UpdateGoalRequest } from '@/services/goal.service';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';

export function useGoals(params?: { status?: string; type?: string; category?: string }) {
  return useQuery({
    queryKey: queryKeys.goals.list(params),
    queryFn: () => goalService.list(params),
    ...cacheConfig.goals,
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: queryKeys.goals.detail(id),
    queryFn: () => goalService.detail(id),
    enabled: !!id,
    ...cacheConfig.goals,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      goalService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useArchiveGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useGoalFeasibility(id: string) {
  return useQuery({
    queryKey: queryKeys.goals.feasibility(id),
    queryFn: () => goalService.feasibility(id),
    enabled: !!id,
    retry: false,
    throwOnError: false,
    ...cacheConfig.ai,
  });
}

export function useGoalProjection(id: string) {
  return useQuery({
    queryKey: queryKeys.goals.projection(id),
    queryFn: () => goalService.projection(id),
    enabled: !!id,
    retry: false,
    throwOnError: false,
    ...cacheConfig.ai,
  });
}

export function useGoalMilestones(goalId: string) {
  return useQuery({
    queryKey: queryKeys.goals.milestones(goalId),
    queryFn: () => goalService.getMilestones(goalId),
    enabled: !!goalId,
    ...cacheConfig.goals,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: { title: string; description?: string; targetDate?: string } }) =>
      goalService.createMilestone(goalId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(goalId) });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId, data }: { goalId: string; milestoneId: string; data: any }) =>
      goalService.updateMilestone(goalId, milestoneId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(goalId) });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      goalService.deleteMilestone(goalId, milestoneId),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(goalId) });
    },
  });
}

export function useGoalPlans(goalId: string) {
  return useQuery({
    queryKey: queryKeys.goals.plans(goalId),
    queryFn: () => goalService.getPlans(goalId),
    enabled: !!goalId,
    ...cacheConfig.goals,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: { title: string; description?: string; steps?: string } }) =>
      goalService.createPlan(goalId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.plans(goalId) });
    },
  });
}

export function useGoalHealth(goalId: string) {
  return useQuery({
    queryKey: queryKeys.goals.health(goalId),
    queryFn: () => goalService.getHealth(goalId),
    enabled: !!goalId,
    ...cacheConfig.goals,
  });
}

export function useRecalculateHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => goalService.recalculateHealth(goalId),
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.health(goalId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(goalId) });
    },
  });
}
