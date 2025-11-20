'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { ProductCategory } from '@lunasis/shared/types';
import { PRODUCT_CATEGORIES } from '@lunasis/shared/constants';

import { BREAKPOINTS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { SelectionGroup } from '@/components/ui/selection-group';
import {
  useProductPrefetch,
  useProductsByCategory,
  ProductCard,
  ProductCardSkeleton,
  generateProductSlug,
} from '@/features/products';

import type { Product } from '@/features/products';
import styles from './ranking.module.scss';

function RankingPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(ProductCategory.TAMPON);
  const { prefetchProductData } = useProductPrefetch();

  // fetch products by category
  const {
    data: productsData,
    isLoading: isLoadingProducts,
    isError: isProductsError,
  } = useProductsByCategory(selectedCategory);

  // product click handler - prefetch product data and navigate to detail page
  const handleProductClick = useCallback(
    (product: Product) => {
      // prefetch product data
      prefetchProductData(product.productId);

      // navigate to product detail page
      const categorySlug = selectedCategory;
      const productSlug = generateProductSlug(product.name);
      router.push(`/products/${categorySlug}/${productSlug}?id=${product.productId}`);
    },
    [selectedCategory, prefetchProductData, router],
  );

  // category change handler
  const handleCategoryChange = useCallback((category: ProductCategory) => {
    setSelectedCategory(category);
  }, []);

  // extract products from api response
  const products = productsData || [];

  return (
    <div className={styles.container}>
      <section className={styles.banner}>
        <h2>Event in Progress</h2>
        <div className={styles.bannerImage}>
          <Image
            src="/banner.png"
            alt="banner"
            priority
            fill
            sizes={`(max-width: ${BREAKPOINTS.MOBILE_MAX}px) 90vw, 80vw`}
          />
        </div>
      </section>

      <div className={styles.header}>
        <h1>This Week&apos;s Ranking</h1>
        <SelectionGroup
          options={PRODUCT_CATEGORIES}
          selectedValue={selectedCategory}
          onSelect={handleCategoryChange}
          layout="grid"
          ariaLabel="Select a product category"
          className={styles.category}
        />
      </div>

      <div className={styles.productsList}>
        {/* loading */}
        {isLoadingProducts && !productsData && (
          <>
            {[...Array(5)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </>
        )}

        {/* error */}
        {!isLoadingProducts && isProductsError && (
          <div className={styles.error}>
            <p>Hmmm, something went wrong...</p>
            <Button onClick={() => window.location.reload()}>Try again</Button>
          </div>
        )}

        {/* empty */}
        {!isLoadingProducts && !isProductsError && products.length === 0 && (
          <div className={styles.empty}>
            <p>We&apos;re preparing something great for you!</p>
          </div>
        )}

        {/* products list */}
        {!isLoadingProducts && !isProductsError && products.length > 0 && (
          <>
            {products.map((product, index) => (
              <article key={product.productId}>
                <ProductCard
                  product={product}
                  rank={index + 1}
                  onClick={() => handleProductClick(product)}
                />
              </article>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default RankingPage;
