'use client';

import styles from './rating.module.scss';
import clsx from 'clsx';

export interface RatingProps {
  rating: number;
  reviewCount?: number;
  size?: 'sm' | 'md';
}

export function Rating({ rating, reviewCount, size = 'sm' }: RatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={styles.container}>
      <div className={styles.stars}>
        {/* full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star key={`full-${i}`} type="full" size={size} />
        ))}

        {/* half star */}
        {hasHalfStar && <Star type="half" size={size} />}

        {/* empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star key={`empty-${i}`} type="empty" size={size} />
        ))}
      </div>

      {reviewCount !== undefined && <p className={styles.count}>({reviewCount})</p>}
    </div>
  );
}

interface StarProps {
  type: 'full' | 'half' | 'empty';
  size: 'sm' | 'md';
}

const Star = ({ type, size }: StarProps) => (
  <svg
    className={clsx(styles.star, styles[`star--${type}`], styles[`star--${size}`])}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <polygon
      points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9"
      stroke="black"
      strokeWidth="1.5"
      fill={type === 'full' ? 'black' : type === 'half' ? 'url(#half-fill)' : 'white'}
    />
    {type === 'half' && (
      <defs>
        <linearGradient id="half-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="50%" stopColor="black" />
          <stop offset="50%" stopColor="white" />
        </linearGradient>
      </defs>
    )}
  </svg>
);
