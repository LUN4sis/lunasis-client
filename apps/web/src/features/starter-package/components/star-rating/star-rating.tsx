'use client';

import { useState } from 'react';
import styles from './star-rating.module.scss';

export interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

// 인터랙티브 별점 컴포넌트 / Interactive star rating component
export const StarRating = ({ value, onChange, size = 'md' }: StarRatingProps) => {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const handleClick = (rating: number) => {
    onChange(rating);
  };

  const handleMouseEnter = (rating: number) => {
    setHoverRating(rating);
  };

  const handleMouseLeave = () => {
    setHoverRating(0);
  };

  const displayRating = hoverRating || value;

  return (
    <div className={styles.container}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          className={styles.starButton}
          onClick={() => handleClick(rating)}
          onMouseEnter={() => handleMouseEnter(rating)}
          onMouseLeave={handleMouseLeave}
          aria-label={`${rating}점`}
        >
          <svg
            className={`${styles.star} ${styles[`star--${size}`]} ${rating <= displayRating ? styles.starFilled : styles.starEmpty}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill={rating <= displayRating ? 'currentColor' : 'none'}
            />
          </svg>
        </button>
      ))}
    </div>
  );
};
