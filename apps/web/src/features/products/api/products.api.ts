import { apiClient } from '@web/api/api';
import type {
  GetProductsParams,
  GetProductsResponse,
  GetProductDetailParams,
  GetProductDetailResponse,
  GetProductBundleParams,
  GetProductBundleResponse,
} from '@repo/shared/types';
import { ErrorCode } from '@repo/shared/types';
import { handleApiError } from '@repo/shared/utils';

/**
 * get products list by params
 */
export async function getProductsAPI(params: GetProductsParams): Promise<GetProductsResponse> {
  const { category } = params;

  const searchParams = new URLSearchParams();
  searchParams.append('category', category);

  const url = `/products?${searchParams}`;

  try {
    const response = await apiClient.get<GetProductsResponse>(url);
    return response;
  } catch (error) {
    throw handleApiError(error, ErrorCode.INTERNAL_SERVER_ERROR);
  }
}

/**
 * get product detail by product id
 */
export async function getProductDetailAPI(
  params: GetProductDetailParams,
): Promise<GetProductDetailResponse> {
  const { productId } = params;

  try {
    const response = await apiClient.get<GetProductDetailResponse>(`/products/${productId}`);
    return response;
  } catch (error) {
    throw handleApiError(error, ErrorCode.NOT_FOUND);
  }
}

/**
 * get product bundle by bundle id
 */
export async function getProductBundleAPI(
  params: GetProductBundleParams,
): Promise<GetProductBundleResponse> {
  const { bundleId } = params;

  const url = `/products/bundle/${bundleId}`;

  try {
    const response = await apiClient.get<GetProductBundleResponse>(url);
    return response;
  } catch (error) {
    throw handleApiError(error, ErrorCode.NOT_FOUND);
  }
}
