import { handleApiError } from '@repo/shared/utils';

import { apiClient } from '@web/api';
import type { GetReviewsRequest, GetReviewsResponse } from '@web/features/products';

// TODO: API 완성 시 구현
export const getReviewsAPI = async ({
  productId,
  cursor,
  pageSize,
}: GetReviewsRequest): Promise<GetReviewsResponse> => {
  try {
    const params = new URLSearchParams();
    params.append('cursor', cursor || '');
    params.append('pageSize', pageSize.toString());
    const response = await apiClient.get<GetReviewsResponse>(`/reviews/${productId}`, {
      params,
    });
    return response;
  } catch (error) {
    throw handleApiError(error);
  }
};
