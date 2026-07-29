import { QueryClient } from '@tanstack/react-query';
import { parseApiError } from '@/api/errors';

function handleGlobalError(error: unknown) {
  const apiError = parseApiError(error);

  if (apiError.code === 'NETWORK_ERROR' || apiError.code === 'TIMEOUT') {
    console.warn('Network error:', apiError.message);
    return;
  }

  if (apiError.code === 'UNAUTHORIZED') {
    return;
  }

  console.warn('API error:', apiError.code, apiError.message);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 1,
      onError: handleGlobalError,
    },
  },
});

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    me: () => ['auth', 'me'] as const,
  },
  tasks: {
    all: ['tasks'] as const,
    lists: () => ['tasks', 'list'] as const,
    list: (params?: Record<string, any>) => ['tasks', 'list', params] as const,
    details: () => ['tasks', 'detail'] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
  },
  goals: {
    all: ['goals'] as const,
    lists: () => ['goals', 'list'] as const,
    list: (params?: Record<string, any>) => ['goals', 'list', params] as const,
    details: () => ['goals', 'detail'] as const,
    detail: (id: string) => ['goals', 'detail', id] as const,
  },
  insights: {
    all: ['insights'] as const,
    lists: () => ['insights', 'list'] as const,
    dailyBrief: () => ['insights', 'dailyBrief'] as const,
    behavioralAwareness: () => ['insights', 'behavioralAwareness'] as const,
    weeklyReview: () => ['insights', 'weeklyReview'] as const,
  },
  focus: {
    all: ['focus'] as const,
    active: () => ['focus', 'active'] as const,
    lists: () => ['focus', 'list'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    lists: () => ['notifications', 'list'] as const,
    unreadCount: () => ['notifications', 'unreadCount'] as const,
  },
  users: {
    all: ['users'] as const,
    profile: () => ['users', 'profile'] as const,
    preferences: () => ['users', 'preferences'] as const,
  },
};
