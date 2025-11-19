'use client';

import { useState, useCallback, useMemo } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import { ROUTES } from '@lunasis/shared/constants';
import { ProductCategory } from '@lunasis/shared/types';
import { handleApiError } from '@lunasis/shared/utils';
import { dynamicWithSkeleton } from '@/lib/utils';
import { RatingSkeleton, TabSkeleton, ProductImageSkeleton } from '@/components/ui/skeleton';

import { Header } from '@products/components/header';
import {
  useProductDetail,
  useFullProductData,
  BadgeList,
  PriceSection,
  ReviewSection,
} from '@products';

import styles from './products.module.scss';

// dynamic import with skeleton
const ProductImage = dynamicWithSkeleton(
  () => import('@/features/products').then((mod) => ({ default: mod.ProductImage })),
  () => <ProductImageSkeleton />,
);

const Rating = dynamicWithSkeleton(
  () => import('@/components/ui/rating').then((mod) => ({ default: mod.Rating })),
  () => <RatingSkeleton />,
);

const Tab = dynamicWithSkeleton(
  () => import('@/components/ui/tab').then((mod) => ({ default: mod.Tab })),
  () => <TabSkeleton />,
);

function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'review' | 'price'>('review');

  const category = params.category as ProductCategory;
  const slug = params.slug as string;
  const productId = searchParams.get('id') || slug; // get product id from url

  // fetch full product data
  const { fullProductData, isLoading: isFullDataLoading } = useFullProductData(
    productId,
    slug,
    category,
  );

  // fetch product detail
  const {
    data: productDetail,
    isError,
    isLoading: isDetailLoading,
  } = useProductDetail({
    productId,
  });

  const handleBackClick = useCallback(() => {
    router.back();
  }, [router]);

  const handlePriceClick = useCallback(
    (count: number) => {
      if (!category || !slug || !productId) return;
      router.push(ROUTES.PRODUCT_BUNDLE(category, slug, count));
    },
    [router, category, slug, productId],
  );

  const tabs = useMemo(
    () => [
      {
        id: 'review',
        label: 'Review',
        content: (
          <div className={styles.reviewContainer}>
            <BadgeList badges={fullProductData?.badges || []} size="lg" />
            <ReviewSection productId={productId} />
          </div>
        ),
      },
      {
        id: 'price',
        label: 'Price',
        content: (
          <PriceSection prices={productDetail?.prices || []} onPriceClick={handlePriceClick} />
        ),
      },
    ],
    [fullProductData?.badges, productId, productDetail?.prices, handlePriceClick],
  );

  if (!category || !slug) {
    throw handleApiError(new Error('Invalid route'));
  }

  // loading
  if (isFullDataLoading || isDetailLoading) {
    return (
      <div className={styles.container}>
        <Header handleBackClick={handleBackClick} />
        <div className={styles.loadingContainer}>
          <div>Getting product data...</div>
        </div>
      </div>
    );
  }

  // error
  if (isError && !productDetail && !fullProductData) {
    throw handleApiError(new Error('Product not found'));
  }

  return (
    <div className={styles.container}>
      <Header handleBackClick={handleBackClick} />

      <section className={styles.productInfo}>
        <div className={styles.imageContainer}>
          <ProductImage
            src={fullProductData?.image || '/placeholder-product.jpg'}
            alt={fullProductData?.name || productDetail?.name || 'Product image'}
            aspectRatio="1/1"
            className={styles.productImage}
          />
        </div>

        <div className={styles.productDetails}>
          <h1>{fullProductData?.name || productDetail?.name}</h1>
          <Rating
            rating={fullProductData?.reviews || 0}
            reviewCount={fullProductData?.reviewCount}
            size="md"
          />
        </div>
      </section>

      <div className={styles.tabSection}>
        <Tab
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={(tabId: string) => {
            setActiveTab(tabId as 'review' | 'price');
          }}
        />
      </div>
    </div>
  );
}

export default ProductDetailPage;
