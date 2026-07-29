import { QueryClient } from '@tanstack/react-query';
import { parseApiError } from '@/api/errors';
import { queryKeys } from '@/lib/queryKeys';

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

export { queryKeys };
