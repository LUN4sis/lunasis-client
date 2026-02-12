'use client';

import { COMMON_IMAGE_PROPS } from '@products/constants/image.constants';
import { useImageError } from '@products/hooks/use-image-error';
import { formatPrice } from '@products/utils';
import type { Mall } from '@repo/shared/types';
import Image from 'next/image';

import styles from './mall-card.module.scss';

export interface MallCardProps {
  mall: Mall;
  rank?: number;
  onClick?: (url: string) => void;
}

export function MallCard({ mall, onClick }: MallCardProps) {
  const { imageSrc, handleError } = useImageError(mall.image);

  const handleClick = () => {
    onClick?.(mall.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <article
      className={styles.card}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View ${mall.name} at ${formatPrice(mall.price)}`}
    >
      <div className={styles.imageContainer}>
        <Image
          src={imageSrc}
          alt={mall.name}
          width={200}
          height={200}
          className={styles.image}
          {...COMMON_IMAGE_PROPS}
          onError={handleError}
        />
      </div>

      <span className={styles.price}>{formatPrice(mall.price)}</span>
    </article>
  );
}
