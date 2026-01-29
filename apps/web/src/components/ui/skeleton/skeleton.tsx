import clsx from 'clsx';

import styles from './skeleton.module.scss';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
}

export function Skeleton({ className, variant = 'rectangular' }: SkeletonProps) {
  return <div className={clsx(styles.skeleton, styles[`skeleton--${variant}`], className)} />;
}

export function ProductImageSkeleton() {
  return <Skeleton className={styles.productImageSkeleton} variant="rectangular" />;
}

export function RatingSkeleton() {
  return (
    <div className={styles.ratingSkeleton}>
      <Skeleton className={styles.stars} variant="rectangular" />
      <Skeleton className={styles.count} variant="text" />
    </div>
  );
}

export function TabSkeleton() {
  return (
    <div className={styles.tabSkeleton}>
      <div className={styles.tabHeader}>
        <Skeleton className={styles.tabItem} variant="rectangular" />
        <Skeleton className={styles.tabItem} variant="rectangular" />
      </div>
      <div className={styles.tabContent}>
        <Skeleton className={styles.contentLine} variant="rectangular" />
        <Skeleton className={styles.contentLine} variant="rectangular" />
        <Skeleton className={styles.contentLine} variant="rectangular" />
      </div>
    </div>
  );
}
