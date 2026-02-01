'use client';

import clsx from 'clsx';
import Image from 'next/image';

import { COMMON_IMAGE_PROPS, PRODUCT_IMAGE_SIZES } from '../../constants/image.constants';
import { useImageError } from '../../hooks/use-image-error';
import styles from './product-image.module.scss';

export interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  fill?: boolean;
  aspectRatio?: string;
}

export function ProductImage({
  src,
  alt,
  width = 200,
  height = 200,
  priority = false,
  className,
  fill = false,
  aspectRatio,
}: ProductImageProps) {
  const { imageSrc, handleError } = useImageError(src);

  const containerStyle = aspectRatio ? { aspectRatio } : undefined;

  // use fill layout
  if (fill) {
    return (
      <div className={clsx(styles.container, className)} style={containerStyle}>
        <Image
          src={imageSrc}
          alt={alt || 'Product image'}
          fill
          sizes={PRODUCT_IMAGE_SIZES}
          className={styles.image}
          {...COMMON_IMAGE_PROPS}
          priority={priority}
          onError={handleError}
        />
      </div>
    );
  }

  // use fixed size layout (backward compatibility)
  return (
    <div className={clsx(styles.container, className)} style={containerStyle}>
      <Image
        src={imageSrc}
        alt={alt || 'Product image'}
        width={width}
        height={height}
        priority={priority}
        className={styles.image}
        sizes={PRODUCT_IMAGE_SIZES}
        {...COMMON_IMAGE_PROPS}
        loading={priority ? 'eager' : 'lazy'}
        onError={handleError}
      />
    </div>
  );
}
