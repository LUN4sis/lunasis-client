const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  OAUTH_CALLBACK: '/oauth/callback',
  OAUTH_REDIRECT: '/oauth2/authorization/google',

  ONBOARDING_NAME: '/onboarding/name',
  ONBOARDING_AGE: '/onboarding/age',
  ONBOARDING_INTERESTS: '/onboarding/interests',

  RANKING: '/ranking',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: (category: string, slug: string) => `${ROUTES.PRODUCTS}/${category}/${slug}`,
  PRODUCT_BUNDLE: (category: string, slug: string, count: number) =>
    `${ROUTES.PRODUCTS}/${category}/${slug}/bundle/${count}`,

  CHAT: '/chat',
  PROFILE: '/profile',
  TEST: '/test',
} as const;

// for bottom navigation(route matching)
export const NAVIGATION_SEGMENTS = {
  PRODUCTS: 'products',
  SHOPPING: 'shopping',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

export { ROUTES };
