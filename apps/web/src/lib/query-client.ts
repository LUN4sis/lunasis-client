import { QueryClient } from '@tanstack/react-query';
import { isRetryableError } from '@repo/shared/utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
      // retry logic for retryable errors
      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;

        return isRetryableError(error);
      },
      // Exponential backoff delay: 1s, 2s, 4s, ... (maximum 30s)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      // Mutations don't retry by default
      retry: false,
    },
  },
});
