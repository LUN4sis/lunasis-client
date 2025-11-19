/**
 * Route matching utilities
 */

/**
 * check if the current path matches a specific pattern
 */
export const isRouteMatch = (pathname: string, pattern: string): boolean => {
  if (pattern === '/') return pathname === '/';
  return pathname === pattern || pathname.startsWith(`${pattern}/`);
};

/**
 * check if the current path matches any of the given patterns
 */
export const isAnyRouteMatch = (pathname: string, patterns: string[]): boolean => {
  return patterns.some((pattern) => isRouteMatch(pathname, pattern));
};

/**
 * check if any of the segments are included in the current segments
 * example:
 *     currentSegments = ["products", "123"]
 *     targetSegments = ["ranking", "products"] -> true
 */
export const hasAnySegment = (currentSegments: string[], targetSegments: string[]): boolean => {
  return targetSegments.some((segment) => currentSegments.includes(segment));
};

/**
 * Route utilities object for convenient importing
 */
export const routeUtils = {
  isRouteMatch,
  isAnyRouteMatch,
  hasAnySegment,
} as const;
