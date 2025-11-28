import { getApiUrl } from '../api/base.api';

export const ROUTES = {
  ROOT: '/',
  HOME: '/home',
  LOGIN: '/login',
  OAUTH_CALLBACK: '/oauth/callback',
  get OAUTH_REDIRECT() {
    return `${getApiUrl(true)}/oauth2/authorization/google`;
  },

  // Onboarding
  ONBOARDING_NAME: '/onboarding/name',
  ONBOARDING_AGE: '/onboarding/age',
  ONBOARDING_INTERESTS: '/onboarding/interests',

  // Shopping
  RANKING: '/ranking',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (category: string, slug: string) => `/products/${category}/${slug}`,
  PRODUCT_BUNDLE: (category: string, slug: string, count: number) =>
    `/products/${category}/${slug}/bundle/${count}`,

  // Communication
  CHAT: '/chat',

  // Community
  COMMUNITY: '/community',
  COMMUNITY_CATEGORY: (category: string) => `/community/${category.toLowerCase()}`,
  COMMUNITY_POST: (postId: string) => `/community/posts/${postId}`,
  COMMUNITY_CREATE: '/community/posts/create',
  COMMUNITY_EDIT: (postId: string) => `/community/posts/${postId}/edit`,

  HOSPITAL: '/hospital',

  // Profile
  PROFILE: '/profile',
} as const;

export const NAVIGATION_SEGMENTS = {
  PRODUCTS: 'products',
  SHOPPING: 'shopping',
  COMMUNITY: 'community',
  CHAT: 'chat',
  PROFILE: 'profile',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
export type NavigationSegment = (typeof NAVIGATION_SEGMENTS)[keyof typeof NAVIGATION_SEGMENTS];
