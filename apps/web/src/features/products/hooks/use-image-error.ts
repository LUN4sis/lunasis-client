import { FALLBACK_IMAGE_PATH } from '@web/lib/constants';
import { useCallback, useState } from 'react';

/**
 * Custom hook for handling image loading errors with fallback
 * @param initialSrc - Initial image source URL
 * @returns Object containing current image source and error handler
 */
export function useImageError(initialSrc: string) {
  const [imageSrc, setImageSrc] = useState(initialSrc);
  const [hasError, setHasError] = useState(false);

  const handleError = useCallback(() => {
    if (!hasError) {
      setHasError(true);
      setImageSrc(FALLBACK_IMAGE_PATH);
    }
  }, [hasError]);

  const currentSrc = hasError ? FALLBACK_IMAGE_PATH : imageSrc;

  return {
    imageSrc: currentSrc,
    handleError,
  };
}
