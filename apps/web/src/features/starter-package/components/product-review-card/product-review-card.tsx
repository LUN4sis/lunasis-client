'use client';

import { TAMPONS, SANITARY_PADS } from '@web/features/starter-package/constants/products.constant';
import { StarRating } from '@web/features/starter-package/components/star-rating/star-rating';
import styles from './product-review-card.module.scss';

export interface ProductReview {
  productKey: string;
  rating: number;
  selectionReason: string;
  review: string;
}

export interface ProductReviewCardProps {
  product: (typeof TAMPONS | typeof SANITARY_PADS)[number];
  review: ProductReview;
  isExpanded: boolean;
  onToggle: () => void;
  onUpdateReview: (updates: Partial<ProductReview>) => void;
}

// 제품명에서 메인/서브 텍스트 추출 / Extract main/sub text from product name
const parseProductName = (name: string): { main: string; sub: string } => {
  const parts = name
    .split(/[–—-]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);

  if (parts.length >= 2) {
    return {
      main: parts[0],
      sub: parts.slice(1).join(' '),
    };
  }

  return {
    main: name,
    sub: '',
  };
};

export const ProductReviewCard = ({
  product,
  review,
  isExpanded,
  onToggle,
  onUpdateReview,
}: ProductReviewCardProps) => {
  const { main, sub } = parseProductName(product.name);

  const handleRatingChange = (rating: number) => {
    onUpdateReview({ rating });
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateReview({ review: e.target.value });
  };

  return (
    <div className={styles.card}>
      {/* Card Header - Always visible */}
      <button
        type="button"
        className={styles.cardHeader}
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-label={`${product.name} 리뷰 ${isExpanded ? '닫기' : '열기'}`}
      >
        <div className={styles.productImage}>
          <img src={product.image} alt={product.name} width={80} height={80} />
        </div>
        <div className={styles.productInfo}>
          <div className={styles.mainText}>{main}</div>
          {sub && <div className={styles.subText}>{sub}</div>}
        </div>
        <svg
          className={`${styles.chevron} ${isExpanded ? styles.chevronExpanded : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Card Content - Expandable */}
      {isExpanded && (
        <div className={styles.cardContent}>
          {/* Selection Reason Info */}
          <div className={styles.infoBox}>
            <div className={styles.infoTitle}>선정 이유</div>
            <div className={styles.badgeContainer}>
              {Array.isArray(product.description) ? (
                product.description.map((desc, index) => (
                  <span key={index} className={styles.badge}>
                    {desc}
                  </span>
                ))
              ) : (
                <span className={styles.badge}>{product.description}</span>
              )}
            </div>
          </div>

          {/* Rating Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>평점</div>
            <StarRating value={review.rating} onChange={handleRatingChange} size="lg" />
          </div>

          {/* Review Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>리뷰</div>
            <textarea
              className={styles.textarea}
              placeholder="제품에 대한 솔직한 의견을 남겨주세요"
              value={review.review}
              onChange={handleReviewChange}
              rows={5}
            />
          </div>
        </div>
      )}
    </div>
  );
};
