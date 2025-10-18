/**
 * 애플리케이션 라우트 상수
 */
const ROUTES = {
  ROOT: '/',
  OAUTH_CALLBACK: '/oauth/callback',
  OAUTH_REDIRECT: '/oauth2/authorization/google',
  ONBOARDING: '/onboarding',
  HOME: '/home',
  TEST: '/test',
  LOGIN: '/login',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];

export { ROUTES };
