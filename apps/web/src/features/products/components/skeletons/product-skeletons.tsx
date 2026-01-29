import { Skeleton } from '@web/components/ui/skeleton';

import styles from './product-skeletons.module.scss';

export function ProductCardSkeleton() {
  return (
    <div className={styles.productCardSkeleton}>
      <Skeleton className={styles.image} variant="rectangular" />
      <div className={styles.content}>
        <Skeleton className={styles.name} variant="text" />
        <Skeleton className={styles.price} variant="rectangular" />
        <Skeleton className={styles.description} variant="rectangular" />
        <div className={styles.badges}>
          <Skeleton className={styles.badge} variant="rectangular" />
          <Skeleton className={styles.badge} variant="rectangular" />
        </div>
      </div>
    </div>
  );
}

export function ReviewSectionSkeleton() {
  return (
    <div className={styles.reviewItemSkeleton}>
      <div className={styles.userInfo}>
        <Skeleton className={styles.avatar} variant="circular" />
        <Skeleton className={styles.name} variant="text" />
      </div>
      <div className={styles.content}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className={styles.review} variant="rectangular" />
        ))}
      </div>
      <div className={styles.reviewInfo}>
        <Skeleton className={styles.date} variant="text" />
        <Skeleton className={styles.mallLogo} variant="rectangular" />
      </div>
    </div>
  );
}

export function MallCardSkeleton() {
  return (
    <div className={styles.mallCardSkeleton}>
      <Skeleton className={styles.image} />
      <div className={styles.content}>
        <Skeleton className={styles.price} />
      </div>
    </div>
  );
}

export function BundlePageSkeleton() {
  return (
    <div className={styles.bundlePageSkeleton}>
      <div className={styles.bestDealSection}>
        <Skeleton className={styles.title} variant="text" />
        <div className={styles.productRow}>
          <Skeleton className={styles.productImage} variant="rectangular" />
          <div className={styles.productInfo}>
            <Skeleton className={styles.productName} variant="text" />
            <Skeleton className={styles.count} variant="text" />
          </div>
        </div>
        <div className={styles.mallCardWrapper}>
          <MallCardSkeleton />
        </div>
      </div>
    </div>
  );
}
