import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, CreateTaskRequest, UpdateTaskRequest } from '@/services/task.service';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';

export function useTasks(params?: { status?: string; category?: string; scheduledDate?: string; goalId?: string }) {
  return useQuery({
    queryKey: queryKeys.tasks.list(params),
    queryFn: () => taskService.list(params),
    ...cacheConfig.tasks,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => taskService.detail(id),
    enabled: !!id,
    ...cacheConfig.tasks,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      if (variables.goalId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(variables.goalId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(variables.goalId) });
      }
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onSuccess: (task, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.lists() });
      if (task?.goalId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.detail(task.goalId) });
        queryClient.invalidateQueries({ queryKey: queryKeys.goals.milestones(task.goalId) });
      }
    },
  });
}

export function useTaskSteps(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.steps(taskId),
    queryFn: () => taskService.steps(taskId),
    enabled: !!taskId,
    retry: false,
    throwOnError: false,
  });
}

export function useSimplifyTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskService.simplify(taskId),
    onSuccess: (_, taskId) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.steps(taskId) });
    },
    retry: false,
  });
}

export function useTaskFocusSessions(taskId: string) {
  return useQuery({
    queryKey: queryKeys.tasks.focusSessions(taskId),
    queryFn: () => taskService.focusSessions(taskId),
    enabled: !!taskId,
    ...cacheConfig.tasks,
  });
}
