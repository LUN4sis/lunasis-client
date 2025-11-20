import { DEFAULT_BLUR_DATA_URL, RESPONSIVE_IMAGE_SIZES } from '@/lib/constants';

/**
 * Common image props for Next.js Image component
 */
export const COMMON_IMAGE_PROPS = {
  placeholder: 'blur' as const,
  blurDataURL: DEFAULT_BLUR_DATA_URL,
  quality: 85,
} as const;

/**
 * Responsive sizes for product images
 * Uses centralized breakpoint constants for consistency
 */
export const PRODUCT_IMAGE_SIZES = RESPONSIVE_IMAGE_SIZES;
