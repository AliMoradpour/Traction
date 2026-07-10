import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { goalService, CreateGoalRequest, UpdateGoalRequest } from '@/services/goal.service';

export const goalKeys = {
  all: ['goals'] as const,
  lists: () => [...goalKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...goalKeys.lists(), params] as const,
  details: () => [...goalKeys.all, 'detail'] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
  milestones: (id: string) => [...goalKeys.all, 'milestones', id] as const,
  plans: (id: string) => [...goalKeys.all, 'plans', id] as const,
  feasibility: (id: string) => [...goalKeys.all, 'feasibility', id] as const,
  projection: (id: string) => [...goalKeys.all, 'projection', id] as const,
  health: (id: string) => [...goalKeys.all, 'health', id] as const,
};

export function useGoals(params?: { status?: string; type?: string; category?: string }) {
  return useQuery({
    queryKey: goalKeys.list(params),
    queryFn: () => goalService.list(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useGoal(id: string) {
  return useQuery({
    queryKey: goalKeys.detail(id),
    queryFn: () => goalService.detail(id),
    enabled: !!id,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGoalRequest) => goalService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      goalService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useArchiveGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useGoalFeasibility(id: string) {
  return useQuery({
    queryKey: goalKeys.feasibility(id),
    queryFn: () => goalService.feasibility(id),
    enabled: !!id,
  });
}

export function useGoalProjection(id: string) {
  return useQuery({
    queryKey: goalKeys.projection(id),
    queryFn: () => goalService.projection(id),
    enabled: !!id,
  });
}

export function useGoalMilestones(goalId: string) {
  return useQuery({
    queryKey: goalKeys.milestones(goalId),
    queryFn: () => goalService.getMilestones(goalId),
    enabled: !!goalId,
  });
}

export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: { title: string; description?: string; targetDate?: string } }) =>
      goalService.createMilestone(goalId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.milestones(goalId) });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId, data }: { goalId: string; milestoneId: string; data: any }) =>
      goalService.updateMilestone(goalId, milestoneId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.milestones(goalId) });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      goalService.deleteMilestone(goalId, milestoneId),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.milestones(goalId) });
    },
  });
}

export function useGoalPlans(goalId: string) {
  return useQuery({
    queryKey: goalKeys.plans(goalId),
    queryFn: () => goalService.getPlans(goalId),
    enabled: !!goalId,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, data }: { goalId: string; data: { title: string; description?: string; steps?: string } }) =>
      goalService.createPlan(goalId, data),
    onSuccess: (_, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.plans(goalId) });
    },
  });
}

export function useGoalHealth(goalId: string) {
  return useQuery({
    queryKey: goalKeys.health(goalId),
    queryFn: () => goalService.getHealth(goalId),
    enabled: !!goalId,
  });
}

export function useRecalculateHealth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (goalId: string) => goalService.recalculateHealth(goalId),
    onSuccess: (_, goalId) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.health(goalId) });
      queryClient.invalidateQueries({ queryKey: goalKeys.detail(goalId) });
    },
  });
}
