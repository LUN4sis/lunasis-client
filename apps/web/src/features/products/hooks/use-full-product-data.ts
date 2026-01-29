import { Product, ProductCategory } from '@repo/shared/types';
import { useMemo } from 'react';

import { generateProductSlug } from '../utils/slug.utils';
import { useProductData, useProductsByCategory } from './use-products';

/**
 * Custom hook to get full product data from cache or list
 * Combines cached product data with product list data as fallback
 *
 * @param productId - Product ID
 * @param slug - Product slug
 * @param category - Product category
 * @returns Full product data and loading state
 */
export function useFullProductData(productId: string, slug: string, category: ProductCategory) {
  const { data: cachedProduct, isLoading: isCachedLoading } = useProductData(productId);
  const { data: productsList, isLoading: isProductsListLoading } = useProductsByCategory(category);

  const fullProductData = useMemo(() => {
    // use cached product if it has valid image
    if (cachedProduct?.image?.trim()) {
      return cachedProduct;
    }

    // Fallback to finding product in list by ID or slug
    return (
      productsList?.find(
        (p: Product) => p.productId === productId || generateProductSlug(p.name) === slug,
      ) || cachedProduct
    );
  }, [cachedProduct, productsList, productId, slug]);

  return {
    fullProductData,
    isLoading: isCachedLoading || isProductsListLoading,
  };
}
