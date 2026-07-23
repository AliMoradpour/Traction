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
    onMutate: async (newGoal) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });
      const previous = queryClient.getQueryData(queryKeys.goals.lists());
      queryClient.setQueryData(queryKeys.goals.lists(), (old: any) => [
        ...(old || []),
        { ...newGoal, id: 'temp-id', createdAt: new Date().toISOString(), progress: 0, status: 'ACTIVE', health: 'ON_TRACK', startDate: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_err, _newGoal, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.lists(), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGoalRequest }) =>
      goalService.update(id, data),
    onMutate: async (updated) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(updated.id) });
      const previous = queryClient.getQueryData(queryKeys.goals.detail(updated.id));
      queryClient.setQueryData(queryKeys.goals.detail(updated.id), (old: any) => ({
        ...old,
        ...updated.data,
      }));
      return { previous };
    },
    onError: (_err, _updated, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.detail(_updated.id), context.previous);
    },
    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.delete(id),
    onMutate: async (deleted) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.lists() });
      const previous = queryClient.getQueryData(queryKeys.goals.lists());
      queryClient.setQueryData(queryKeys.goals.lists(), (old: any) =>
        (old || []).filter((g: any) => g.id !== deleted)
      );
      return { previous };
    },
    onError: (_err, _deleted, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.lists(), context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.lists() });
    },
  });
}

export function useArchiveGoal() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => goalService.archive(id),
    onMutate: async (archived) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.detail(archived) });
      const previous = queryClient.getQueryData(queryKeys.goals.detail(archived));
      queryClient.setQueryData(queryKeys.goals.detail(archived), (old: any) => ({
        ...old,
        status: 'ARCHIVED',
      }));
      return { previous };
    },
    onError: (_err, _archived, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.detail(_archived), context.previous);
    },
    onSettled: (_, __, id) => {
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
    onMutate: async ({ goalId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.milestones(goalId) });
      const previous = queryClient.getQueryData(queryKeys.goals.milestones(goalId));
      queryClient.setQueryData(queryKeys.goals.milestones(goalId), (old: any) => [
        ...(old || []),
        { ...data, id: 'temp-id', goalId, progress: 0, status: 'PENDING', createdAt: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_err, { goalId }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.milestones(goalId), context.previous);
    },
    onSettled: (_, __, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(goalId) });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId, data }: { goalId: string; milestoneId: string; data: any }) =>
      goalService.updateMilestone(goalId, milestoneId, data),
    onMutate: async ({ goalId, milestoneId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.milestones(goalId) });
      const previous = queryClient.getQueryData(queryKeys.goals.milestones(goalId));
      queryClient.setQueryData(queryKeys.goals.milestones(goalId), (old: any) =>
        (old || []).map((m: any) => (m.id === milestoneId ? { ...m, ...data } : m))
      );
      return { previous };
    },
    onError: (_err, { goalId }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.milestones(goalId), context.previous);
    },
    onSettled: (_, __, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(goalId) });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ goalId, milestoneId }: { goalId: string; milestoneId: string }) =>
      goalService.deleteMilestone(goalId, milestoneId),
    onMutate: async ({ goalId, milestoneId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.milestones(goalId) });
      const previous = queryClient.getQueryData(queryKeys.goals.milestones(goalId));
      queryClient.setQueryData(queryKeys.goals.milestones(goalId), (old: any) =>
        (old || []).filter((m: any) => m.id !== milestoneId)
      );
      return { previous };
    },
    onError: (_err, { goalId }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.milestones(goalId), context.previous);
    },
    onSettled: (_, __, { goalId }) => {
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
    onMutate: async ({ goalId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.plans(goalId) });
      const previous = queryClient.getQueryData(queryKeys.goals.plans(goalId));
      queryClient.setQueryData(queryKeys.goals.plans(goalId), (old: any) => [
        ...(old || []),
        { ...data, id: 'temp-id', goalId, status: 'PENDING', createdAt: new Date().toISOString() },
      ]);
      return { previous };
    },
    onError: (_err, { goalId }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.plans(goalId), context.previous);
    },
    onSettled: (_, __, { goalId }) => {
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

export function useUpdatePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, planId, data }: { goalId: string; planId: string; data: any }) =>
      goalService.updatePlan(goalId, planId, data),
    onMutate: async ({ goalId, planId, data }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.plans(goalId) });
      const previous = queryClient.getQueryData(queryKeys.goals.plans(goalId));
      queryClient.setQueryData(queryKeys.goals.plans(goalId), (old: any) =>
        (old || []).map((p: any) => (p.id === planId ? { ...p, ...data } : p))
      );
      return { previous };
    },
    onError: (_err, { goalId }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.plans(goalId), context.previous);
    },
    onSettled: (_, __, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.plans(goalId) });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, planId }: { goalId: string; planId: string }) =>
      goalService.deletePlan(goalId, planId),
    onMutate: async ({ goalId, planId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.goals.plans(goalId) });
      const previous = queryClient.getQueryData(queryKeys.goals.plans(goalId));
      queryClient.setQueryData(queryKeys.goals.plans(goalId), (old: any) =>
        (old || []).filter((p: any) => p.id !== planId)
      );
      return { previous };
    },
    onError: (_err, { goalId }, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.goals.plans(goalId), context.previous);
    },
    onSettled: (_, __, { goalId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.goals.plans(goalId) });
    },
  });
}
