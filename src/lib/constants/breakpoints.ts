export const BREAKPOINTS = {
  MOBILE_MAX: 768,
  TABLET_MIN: 769,
  TABLET_MAX: 1024,
  DESKTOP_MIN: 1024,
  LARGE_DESKTOP_MIN: 1200,
} as const;

export const MEDIA_QUERIES = {
  MOBILE: `(max-width: ${BREAKPOINTS.MOBILE_MAX}px)`,
  TABLET: `(min-width: ${BREAKPOINTS.TABLET_MIN}px) and (max-width: ${BREAKPOINTS.TABLET_MAX}px)`,
  DESKTOP: `(min-width: ${BREAKPOINTS.DESKTOP_MIN}px)`,
  LARGE_DESKTOP: `(min-width: ${BREAKPOINTS.LARGE_DESKTOP_MIN}px)`,
} as const;

/**
 * Image sizes string for Next.js Image component
 * Optimized for responsive loading
 */
export const RESPONSIVE_IMAGE_SIZES = `(max-width: ${BREAKPOINTS.MOBILE_MAX}px) 100vw, (max-width: ${BREAKPOINTS.LARGE_DESKTOP_MIN}px) 50vw, 33vw`;
