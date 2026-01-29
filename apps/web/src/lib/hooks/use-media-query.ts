import { MEDIA_QUERIES } from '@web/lib/constants';
import { useEffect, useState } from 'react';

/**
 * Custom hook for responsive media queries
 * @param query - Media query string (e.g., '(min-width: 1024px)')
 * @returns Boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // set initial value
    setMatches(media.matches);

    // create event listener
    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches);
    };

    // add listener
    media.addEventListener('change', listener);

    // cleanup event listener
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

/**
 * Hook for mobile breakpoint (768px and below)
 * @returns Boolean indicating if the screen is mobile size
 */
export function useIsMobile(): boolean {
  return useMediaQuery(MEDIA_QUERIES.MOBILE);
}

/**
 * Hook for tablet breakpoint (769px to 1024px)
 * @returns Boolean indicating if the screen is tablet size
 */
export function useIsTablet(): boolean {
  return useMediaQuery(MEDIA_QUERIES.TABLET);
}

/**
 * Hook for desktop breakpoint (1024px and above)
 * @returns Boolean indicating if the screen is desktop size
 */
export function useIsDesktop(): boolean {
  return useMediaQuery(MEDIA_QUERIES.DESKTOP);
}

/**
 * Hook for large desktop breakpoint (1200px and above)
 * @returns Boolean indicating if the screen is large desktop size
 */
export function useIsLargeDesktop(): boolean {
  return useMediaQuery(MEDIA_QUERIES.LARGE_DESKTOP);
}
