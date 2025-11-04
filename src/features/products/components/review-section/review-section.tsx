'use client';

import Image from 'next/image';

import { handleApiError } from '@/lib/utils';
import { useReviews } from '@products/hooks/use-reviews';
import { ReviewSectionSkeleton } from '@products/components/skeletons/product-skeletons';
import { COMMON_IMAGE_PROPS } from '@products/constants/image.constants';
import { useImageError } from '@products/hooks/use-image-error';

import type { Review } from '@products/types/review.type';
import styles from './review-section.module.scss';

interface ReviewSectionProps {
  productId: string;
}

const ReviewItem = ({ review }: { review: Review }) => {
  const { imageSrc: profileSrc, handleError: handleProfileError } = useImageError(
    review.profileImg,
  );
  const { imageSrc: logoSrc, handleError: handleLogoError } = useImageError(review.mallLogo);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className={styles.reviewItem}>
      <div className={styles.userInfo}>
        <Image
          src={profileSrc}
          alt={`${review.nickname} profile`}
          width={40}
          height={40}
          sizes="40px"
          {...COMMON_IMAGE_PROPS}
          onError={handleProfileError}
        />
        <span>{review.nickname}</span>
      </div>

      <div className={styles.content}>
        <p>{review.content}</p>
      </div>

      <div className={styles.reviewInfo}>
        <span>{formatDate(review.createdAt)}</span>
        <Image
          src={logoSrc}
          alt="mall logo"
          width={24}
          height={24}
          sizes="24px"
          className={styles.mallLogoImage}
          {...COMMON_IMAGE_PROPS}
          onError={handleLogoError}
        />
      </div>
    </div>
  );
};

export const ReviewSection = ({ productId }: ReviewSectionProps) => {
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useReviews({ productId });

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        {Array.from({ length: 5 }).map((_, index) => (
          <ReviewSectionSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError) {
    throw handleApiError(error);
  }

  const allReviews: Review[] = (data?.pages ?? [])
    .flatMap((page) => (Array.isArray(page.reviews) ? page.reviews : []))
    .filter((r): r is Review => Boolean(r));

  if (allReviews.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.empty}>
          <h3>No reviews yet</h3>
          <p>Write the first review for this product!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {allReviews.map((review: Review, index: number) => (
        <ReviewItem
          key={review.id ?? `${review.nickname}-${review.createdAt}-${index}`}
          review={review}
        />
      ))}

      {hasNextPage && (
        <div className={styles.moreReviews} onClick={handleLoadMore}>
          <p>Load more reviews</p>
        </div>
      )}

      {isFetchingNextPage && (
        <div className={styles.loading}>
          {Array.from({ length: 3 }).map((_, index) => (
            <ReviewSectionSkeleton key={index} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
