import { AppError, ErrorCode } from '@lunasis/shared/types';
import { logger } from '@lunasis/shared/utils';

export interface FormatPriceOptions {
  fractionDigits?: number;
}

/**
 * Format a price value to USD currency format
 * @param price - The price value to format
 * @param options - Optional formatting options
 * @returns Formatted price string
 */
export const formatPrice = (price: number, options?: FormatPriceOptions): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    ...(options?.fractionDigits !== undefined && {
      minimumFractionDigits: options.fractionDigits,
      maximumFractionDigits: options.fractionDigits,
    }),
  }).format(price);
};

/**
 * Calculate unit price from total price and count
 * @param totalPrice - The total price
 * @param count - The number of items
 * @returns Unit price per item
 */
export const calculateUnitPrice = (totalPrice: number, count: number): number => {
  if (count <= 0) {
    const error = new AppError(
      ErrorCode.VALIDATION_ERROR,
      `Invalid count value: ${count}. Count must be a positive number.`,
    );

    logger.error('[calculateUnitPrice]', error.toJSON());
    return 0;
  }

  return totalPrice / count;
};
