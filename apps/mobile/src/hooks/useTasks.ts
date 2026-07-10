import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService, CreateTaskRequest, UpdateTaskRequest } from '@/services/task.service';

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...taskKeys.lists(), params] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string) => [...taskKeys.details(), id] as const,
  steps: (id: string) => [...taskKeys.all, 'steps', id] as const,
  focusSessions: (id: string) => [...taskKeys.all, 'focusSessions', id] as const,
};

export function useTasks(params?: { status?: string; category?: string; scheduledDate?: string; goalId?: string }) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => taskService.list(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.detail(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      taskService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => taskService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useTaskSteps(taskId: string) {
  return useQuery({
    queryKey: taskKeys.steps(taskId),
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
      queryClient.invalidateQueries({ queryKey: taskKeys.steps(taskId) });
    },
    retry: false,
  });
}

export function useTaskFocusSessions(taskId: string) {
  return useQuery({
    queryKey: taskKeys.focusSessions(taskId),
    queryFn: () => taskService.focusSessions(taskId),
    enabled: !!taskId,
  });
}
