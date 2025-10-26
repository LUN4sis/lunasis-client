const ROUTES = {
  ROOT: '/',
  LOGIN: '/login',
  OAUTH_CALLBACK: '/oauth/callback',
  OAUTH_REDIRECT: '/oauth2/authorization/google',

  ONBOARDING_NAME: '/onboarding/name',
  ONBOARDING_AGE: '/onboarding/age',
  ONBOARDING_INTERESTS: '/onboarding/interests',

  HOME: '/',
  CHAT: '/chat',
  PRODUCT: '/product',
  PROFILE: '/profile',
  TEST: '/test',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

export { ROUTES };
