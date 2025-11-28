'use client';
import Image from 'next/image';

import { formatPrice } from '@products/utils';
import { useImageError } from '@products/hooks/use-image-error';
import { COMMON_IMAGE_PROPS } from '@products/constants/image.constants';

import type { Mall } from '@repo/shared/types';
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

  return (
    <article className={styles.card} onClick={handleClick}>
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
