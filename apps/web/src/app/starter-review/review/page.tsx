'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@web/features/products/components/header';
import { TAMPONS, SANITARY_PADS } from '@web/features/starter-package/constants/products.constant';
import {
  ProductReviewCard,
  type ProductReview,
} from '@web/features/starter-package/components/product-review-card/product-review-card';
import styles from './review.module.scss';

type PackageType = 'tampon' | 'pad' | 'both';
type Product = (typeof TAMPONS | typeof SANITARY_PADS)[number];

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const packageType = (searchParams.get('type') as PackageType) || 'pad';

  // 제품 리스트 결정
  const products: Product[] =
    packageType === 'both'
      ? [...TAMPONS, ...SANITARY_PADS]
      : packageType === 'tampon'
        ? [...TAMPONS]
        : [...SANITARY_PADS];

  // 각 제품의 리뷰 상태 관리
  const [reviews, setReviews] = useState<Record<string, ProductReview>>(
    products.reduce(
      (acc, product) => ({
        ...acc,
        [product.key]: {
          productKey: product.key,
          rating: 0,
          selectionReason: '',
          review: '',
        },
      }),
      {},
    ),
  );

  // 확장된 카드 상태 관리
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const handleToggleCard = (productKey: string) => {
    setExpandedCard((prev) => (prev === productKey ? null : productKey));
  };

  const handleUpdateReview = (productKey: string, updates: Partial<ProductReview>) => {
    setReviews((prev) => ({
      ...prev,
      [productKey]: {
        ...prev[productKey],
        ...updates,
      },
    }));
  };

  return (
    <>
      <Header handleBackClick={handleBack} />
      <section className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>리뷰 작성</h1>
            <p className={styles.description}>각 제품을 클릭하여 리뷰를 남겨주세요</p>
          </div>

          <div className={styles.productList}>
            {products.map((product) => (
              <ProductReviewCard
                key={product.key}
                product={product}
                review={reviews[product.key]}
                isExpanded={expandedCard === product.key}
                onToggle={() => handleToggleCard(product.key)}
                onUpdateReview={(updates) => handleUpdateReview(product.key, updates)}
              />
            ))}
          </div>

          <div className={styles.helpSection}>
            <p className={styles.helpText}>궁금한 점이 있으신가요?</p>
          </div>
        </div>
      </section>
    </>
  );
}
