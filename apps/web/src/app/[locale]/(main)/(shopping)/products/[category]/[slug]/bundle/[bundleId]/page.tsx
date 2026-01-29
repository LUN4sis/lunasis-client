'use client';

import {
  BundlePageSkeleton,
  Mall,
  MallCard,
  useFullProductData,
  useProductBundle,
  useProductDetail,
} from '@products';
import { Header } from '@products/components/header';
import { ProductCategory, ProductPrice } from '@repo/shared/types';
import { handleApiError } from '@repo/shared/utils';
import { ProductImageSkeleton } from '@web/components/ui/skeleton';
import { dynamicWithSkeleton } from '@web/lib/utils';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import styles from './bundle.module.scss';

// dynamic import with skeleton
const ProductImage = dynamicWithSkeleton(
  () => import('@web/features/products').then((mod) => ({ default: mod.ProductImage })),
  () => <ProductImageSkeleton />,
);

function BundlePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const category = params.category as ProductCategory;
  const slug = params.slug as string;
  const bundleCountParam = params.bundleId as string;
  const bundleCount = parseInt(bundleCountParam, 10);

  // get product id from url
  const productIdFromParam = searchParams.get('id') || slug;

  // fetch full product data
  const { fullProductData, isLoading: isLoadingFullData } = useFullProductData(
    productIdFromParam,
    slug,
    category,
  );

  // fetch product detail
  const { data: productDetail, isLoading: isLoadingDetail } = useProductDetail({
    productId: productIdFromParam,
  });

  // extract verified product id from api response
  const verifiedProductId = useMemo(() => {
    if (fullProductData?.productId) {
      return fullProductData.productId;
    }

    if (productDetail?.prices?.[0]?.id) {
      // get product id from productDetail
      return productDetail.prices?.[0]?.id.split('-bundle-')[0];
    }

    return productIdFromParam;
  }, [fullProductData?.productId, productDetail, productIdFromParam]);

  // get bundle id from product detail
  const bundleIdFromParam = useMemo(() => {
    if (!productDetail?.prices) return null;

    const priceOption = productDetail.prices.find((p: ProductPrice) => p.count === bundleCount);

    return priceOption?.id || null;
  }, [productDetail?.prices, bundleCount]);

  // construct fallback bundle id
  const fallbackBundleId = useMemo(() => {
    return `${verifiedProductId}-bundle-${bundleCount}`;
  }, [verifiedProductId, bundleCount]);

  const bundleId = bundleIdFromParam || fallbackBundleId;

  // fetch mall price data
  const {
    data: mallsResponse,
    isLoading: isLoadingMalls,
    isError: isMallsError,
  } = useProductBundle({
    bundleId,
  });

  // extract malls from api response
  const malls = useMemo(() => {
    if (Array.isArray(mallsResponse)) return mallsResponse;

    if (mallsResponse && typeof mallsResponse === 'object') {
      const responseWithMalls = mallsResponse as { malls?: unknown };
      if (Array.isArray(responseWithMalls.malls)) {
        return responseWithMalls.malls;
      }
    }
    return [];
  }, [mallsResponse]);

  const sortedMalls = useMemo(() => {
    if (!Array.isArray(malls) || malls.length === 0) {
      return [];
    }
    return [...malls].sort((a, b) => a.price - b.price);
  }, [malls]);

  // handle back click
  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  const handleMallClick = useCallback((mall: Mall) => {
    if (mall.url) {
      window.open(mall.url, '_blank', 'noopener,noreferrer');
    }
  }, []);

  if (!slug || !bundleCount || isNaN(bundleCount)) {
    throw handleApiError(new Error('Invalid route'));
  }

  // loading
  if (isLoadingFullData || isLoadingDetail || isLoadingMalls) {
    return (
      <div className={styles.container}>
        <Header handleBackClick={handleBackClick} />
        <BundlePageSkeleton />
      </div>
    );
  }

  // error
  if (isMallsError || !Array.isArray(malls) || malls.length === 0) {
    throw handleApiError(new Error('Bundle not found'));
  }

  const bestPriceMall = sortedMalls[0];

  return (
    <div className={styles.container}>
      <Header handleBackClick={handleBackClick} />

      <div className={styles.content}>
        {/* Best Deal */}
        <section className={styles.bestDeal}>
          <h1>Best Deal</h1>

          <div className={styles.bestDealContent}>
            <div className={styles.imageContainer}>
              <ProductImage
                src={fullProductData?.image || '/placeholder-product.jpg'}
                alt={productDetail?.name || fullProductData?.name || 'Product image'}
                aspectRatio="1/1"
              />
            </div>

            <div className={styles.productInfo}>
              <h2>{productDetail?.name || fullProductData?.name || 'Product name'}</h2>
              <span className={styles.count}>{bundleCount} Count</span>
            </div>
          </div>

          <div className={styles.mallCard}>
            <MallCard
              mall={{
                id: bestPriceMall.id,
                image: bestPriceMall.image,
                name: bestPriceMall.name,
                url: bestPriceMall.url,
                price: bestPriceMall.price,
              }}
              onClick={() => handleMallClick(bestPriceMall)}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

export default BundlePage;
