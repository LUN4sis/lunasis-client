import { isAuthError } from '@repo/shared/features/auth/constants/auth.constants';
import {
  type GetProductBundleParams,
  type GetProductDetailParams,
  type GetProductsParams,
  isAppError,
  type Product,
  ProductCategory,
} from '@repo/shared/types';
import { logger, transformError } from '@repo/shared/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getProductBundleAPI, getProductDetailAPI, getProductsAPI } from '../api/products.api';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: GetProductsParams) => [...productKeys.lists(), filters] as const,
  infiniteList: (filters: GetProductsParams) =>
    [...productKeys.lists(), 'infinite', filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
  bundles: () => [...productKeys.all, 'bundle'] as const,
  bundle: (id: string) => [...productKeys.bundles(), id] as const,
  // for individual product data caching (prefetching)
  productData: (id: string) => [...productKeys.all, 'data', id] as const,
};

/**
 * get products list
 */
export function useProducts(params: GetProductsParams) {
  return useQuery({
    queryKey: productKeys.list(params),
    queryFn: async () => {
      try {
        const response = await getProductsAPI(params);
        return response;
      } catch (error) {
        const appError = transformError(error);
        if (isAppError(error) && isAuthError(error.code)) {
          logger.info('[useProducts] Auth error handled silently');
        } else {
          logger.error('[useProducts] Error fetching products:', appError.toJSON());
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

/**
 * get products by category
 */
export function useProductsByCategory(category: ProductCategory) {
  logger.info('[useProductsByCategory] category:', { category });
  const result = useProducts({ category });
  logger.info('[useProductsByCategory] data:', {
    hasData: !!result.data,
    isLoading: result.isLoading,
    isError: result.isError,
  });
  return result;
}

/**
 * get product detail
 */
export function useProductDetail(params: GetProductDetailParams) {
  return useQuery({
    queryKey: productKeys.detail(params.productId),
    queryFn: () => getProductDetailAPI(params),
    enabled: !!params.productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * get product bundle
 */
export function useProductBundle(params: GetProductBundleParams) {
  return useQuery({
    queryKey: productKeys.bundle(params.bundleId),
    queryFn: () => getProductBundleAPI(params),
    enabled: !!params.bundleId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

/**
 * get product data from cache
 * used before navigating to product detail page
 */
export function useProductData(productId: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: productKeys.productData(productId),
    queryFn: () => {
      // find product data in cache
      const listMatches = queryClient.getQueriesData<Product[]>({
        queryKey: productKeys.lists(),
        exact: false,
      });

      for (const [, data] of listMatches) {
        if (Array.isArray(data)) {
          const found = data.find((p: Product) => p.productId === productId);
          if (found) return found;
        }
      }

      // if not found in cache, return empty object (fetched from other API in detail page)
      return {
        productId,
        name: '',
        image: '',
        reviews: 0,
        reviewCount: 0,
        price: 0,
        description: '',
        badges: [],
      } as Product;
    },
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * prefetch product data
 */
export function useProductPrefetch() {
  const queryClient = useQueryClient();

  const prefetchProductData = (productId: string) => {
    // prefetch product data in current list/infinite list cache
    try {
      const listMatches = queryClient.getQueriesData<Product[] | unknown>({
        queryKey: productKeys.lists(),
        exact: false,
      });
      for (const [, data] of listMatches) {
        if (Array.isArray(data)) {
          const found = data.find((p: Product) => p.productId === productId);
          if (found) {
            queryClient.setQueryData(productKeys.productData(productId), found);
            return; // found in list cache, no need to prefetch from detail API
          }
        }
      }
    } catch {}
  };

  const prefetchProductsByCategory = (category: ProductCategory) => {
    queryClient.prefetchQuery({
      queryKey: productKeys.list({ category }),
      queryFn: () => getProductsAPI({ category }),
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchProductData,
    prefetchProductsByCategory,
  };
}
