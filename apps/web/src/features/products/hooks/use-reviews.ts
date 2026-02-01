import { useInfiniteQuery } from '@tanstack/react-query';

import { getReviewsAPI } from '../api/reviews.api';
import type { GetReviewsResponse } from '../types/review.type';

interface UseReviewsParams {
  productId: string;
  enabled?: boolean;
  pageSize?: number;
}

export const useReviews = ({ productId, enabled = true, pageSize = 10 }: UseReviewsParams) => {
  return useInfiniteQuery<GetReviewsResponse, Error>({
    queryKey: ['reviews', 'infinite', productId, pageSize],
    queryFn: async ({ pageParam = null }) => {
      const response = await getReviewsAPI({
        productId,
        cursor: pageParam as string | null,
        pageSize,
      });
      return response;
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    enabled: enabled && !!productId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
