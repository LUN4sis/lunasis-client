import clsx from 'clsx';
import { formatPrice, calculateUnitPrice } from '@products/utils';

import type { ProductPrice } from '@lunasis/shared/types';
import styles from './price-section.module.scss';

export interface PriceSectionProps {
  prices: ProductPrice[];
  onPriceClick: (count: number) => void;
  className?: string;
  selectedCount?: number;
}

export function PriceSection({
  prices,
  onPriceClick,
  className,
  selectedCount,
}: PriceSectionProps) {
  if (!prices || prices.length === 0) {
    return null;
  }

  const getPriceItemClasses = (price: ProductPrice) => {
    const isSelected = selectedCount === price.count;

    return clsx(styles.priceItem, {
      [styles.selected]: isSelected,
    });
  };

  const handlePriceClick = (count: number) => {
    onPriceClick(count);
  };

  return (
    <section className={clsx(styles.priceList, className)}>
      {prices.map((price) => (
        <button
          key={price.id}
          type="button"
          className={getPriceItemClasses(price)}
          onClick={() => handlePriceClick(price.count)}
          aria-pressed={selectedCount === price.count}
        >
          <div className={styles.productInfo}>
            <span>{price.count} Count</span>
            <div className={styles.priceDetail}>
              <span>{formatPrice(price.price)}</span>
              <span>
                {formatPrice(calculateUnitPrice(price.price, price.count), { fractionDigits: 2 })} /
                1EA
              </span>
              <span>{price.mallCount} Mall</span>
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}
