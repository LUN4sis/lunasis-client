import { memo, useState } from 'react';

import { useIsDesktop } from '@/lib/hooks';
import { Badge } from '@/components/ui/badge';
import { Rating } from '@/components/ui/rating';

import { ProductImage } from '@products/components/product-image';
import { formatPrice } from '@products/utils';

import type { Product } from '@products/types/product.type';
import styles from './product-card.module.scss';

export interface ProductCardProps {
  product: Product;
  rank?: number;
  onClick?: (productId: string) => void;
  className?: string;
}

export const ProductCard = memo(({ product, rank, onClick, className }: ProductCardProps) => {
  const [showAllBadges, setShowAllBadges] = useState(false);
  const isDesktop = useIsDesktop();

  const handleClick = () => {
    onClick?.(product.productId);
  };

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <article className={`${styles.card} ${className || ''}`} onClick={handleClick}>
      <div className={styles.imageWrapper}>
        {rank && (
          <div className={styles.rank}>
            <span className={styles.rankNumber}>{rank}</span>
          </div>
        )}
        <div className={styles.imageContainer}>
          <ProductImage src={product.image} alt={product.name} fill aspectRatio="1 / 1" />
        </div>
      </div>

      <div className={styles.content}>
        <h3 className={styles.name}>{product.name}</h3>

        <div className={styles.ratingPrice}>
          <div className={styles.rating}>
            <Rating rating={product.reviews} reviewCount={product.reviewCount} size="sm" />
          </div>
          <span className={styles.price}>{formatPrice(product.price)}</span>
        </div>

        <p>{`"${product.description}"`}</p>

        {product.badges && product.badges.length > 0 && (
          <div className={styles.badges}>
            {(isDesktop && showAllBadges ? product.badges : product.badges.slice(0, 2)).map(
              (badge, index) => (
                <Badge
                  key={index}
                  text={badge}
                  colorScheme="purple"
                  size="md"
                  onClick={handleBadgeClick}
                />
              ),
            )}
            {isDesktop && product.badges.length > 2 && !showAllBadges && (
              <button
                className={styles.moreBadges}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllBadges(true);
                }}
                aria-label={`${product.badges.length - 2} more badges`}
              >
                +{product.badges.length - 2}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  );
});

ProductCard.displayName = 'ProductCard';
