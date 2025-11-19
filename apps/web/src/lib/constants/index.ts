// Re-export shared constants
export {
  ROUTES,
  NAVIGATION_SEGMENTS,
  getApiUrl,
  type RouteKey,
  type RoutePath,
  type NavigationSegment,
} from '@lunasis/shared/constants';
export {
  APP_CONFIG,
  API_CONFIG,
  NOTIFICATION_CONFIG,
  STORAGE_KEYS,
  PAGINATION_CONFIG,
  isDevelopment,
  isProduction,
} from '@lunasis/shared/constants';
export { MESSAGES, CONFIRM_MESSAGES } from '@lunasis/shared/constants';
export {
  PRODUCT_CATEGORIES,
  COMMUNITY_CATEGORIES,
  getCategoryDisplay,
  getProductCategoryDisplay,
  getCommunityCategoryDisplay,
  type Category,
} from '@lunasis/shared/constants';

// Web-specific constants
export * from './image';
export * from './breakpoints';
