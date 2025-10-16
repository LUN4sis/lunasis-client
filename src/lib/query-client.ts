import { QueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    },
    mutations: {
      retry: 0,
      onError: (error) => {
        // Global mutation error handler
        logger.error('[React Query] Mutation error:', error);
      },
    },
  },
});
