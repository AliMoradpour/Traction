import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { focusService } from '@/services/focus.service';

export const focusKeys = {
  all: ['focus'] as const,
  lists: () => [...focusKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...focusKeys.lists(), params] as const,
  details: () => [...focusKeys.all, 'detail'] as const,
  detail: (id: string) => [...focusKeys.details(), id] as const,
  active: () => [...focusKeys.all, 'active'] as const,
};

export function useStartFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId?: string) => focusService.start(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
      queryClient.invalidateQueries({ queryKey: focusKeys.lists() });
    },
  });
}

export function usePauseFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.pause(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: focusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
    },
  });
}

export function useResumeFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: focusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
    },
  });
}

export function useCompleteFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: focusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
      queryClient.invalidateQueries({ queryKey: focusKeys.lists() });
    },
  });
}

export function useCancelFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: focusKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: focusKeys.active() });
      queryClient.invalidateQueries({ queryKey: focusKeys.lists() });
    },
  });
}

export function useActiveFocusSession() {
  return useQuery({
    queryKey: focusKeys.active(),
    queryFn: () => focusService.getActive(),
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useFocusSessions(params?: { status?: string; taskId?: string }) {
  return useQuery({
    queryKey: focusKeys.list(params),
    queryFn: () => focusService.list(params),
    staleTime: 2 * 60 * 1000,
  });
}

export function useFocusSession(id: string) {
  return useQuery({
    queryKey: focusKeys.detail(id),
    queryFn: () => focusService.detail(id),
    enabled: !!id,
  });
}
