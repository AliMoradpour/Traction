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
      // Retrying a 4xx (bad input, forbidden, not found) can't succeed; only retry transient failures.
      retry: (failureCount, error) => {
        const status = parseApiError(error).status;
        if (
          status !== undefined &&
          status >= 400 &&
          status < 500 &&
          status !== 408 &&
          status !== 429
        ) {
          return false;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      // Writes aren't idempotent: retrying a POST that timed out after reaching the server
      // would create duplicates.
      retry: 0,
      onError: handleGlobalError,
    },
  },
});

export { queryKeys };
