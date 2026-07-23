import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { focusService } from '@/services/focus.service';
import { queryKeys } from '@/lib/queryKeys';
import { cacheConfig } from '@/lib/cacheConfig';

export function useStartFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId?: string) => focusService.start(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.lists() });
    },
  });
}

export function usePauseFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.pause(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.active() });
    },
  });
}

export function useResumeFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.resume(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.active() });
    },
  });
}

export function useCompleteFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.complete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.lists() });
    },
  });
}

export function useCancelFocusSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => focusService.cancel(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.active() });
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.lists() });
    },
  });
}

export function useActiveFocusSession() {
  return useQuery({
    queryKey: queryKeys.focus.active(),
    queryFn: () => focusService.getActive(),
    ...cacheConfig.focus,
  });
}

export function useFocusSessions(params?: { status?: string; taskId?: string }) {
  return useQuery({
    queryKey: queryKeys.focus.list(params),
    queryFn: () => focusService.list(params),
    ...cacheConfig.focus,
  });
}

export function useFocusSession(id: string) {
  return useQuery({
    queryKey: queryKeys.focus.detail(id),
    queryFn: () => focusService.detail(id),
    enabled: !!id,
    ...cacheConfig.focus,
  });
}
