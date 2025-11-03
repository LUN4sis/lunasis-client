import dynamic, { DynamicOptions, Loader } from 'next/dynamic';
import { ComponentType } from 'react';

/**
 * Dynamic import with skeleton loading fallback
 *
 * @example
 * ```tsx
 * const ProductImage = dynamicWithSkeleton(
 *   () => import('@/features/products').then(mod => ({ default: mod.ProductImage })),
 *   () => <ProductImageSkeleton />
 * );
 * ```
 */
export function dynamicWithSkeleton<P = object>(
  loader: Loader<P>,
  skeletonComponent: () => React.ReactNode,
  options?: Omit<DynamicOptions<P>, 'loading'>,
): ComponentType<P> {
  return dynamic(loader, {
    ...options,
    loading: skeletonComponent,
  });
}
