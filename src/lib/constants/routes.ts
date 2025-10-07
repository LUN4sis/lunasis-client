/**
 * 애플리케이션 라우트 상수
 */
export const ROUTES = {
  HOME: '/',
  TEST: '/test',
} as const;

export type RouteKey = keyof typeof ROUTES;
export type RoutePath = (typeof ROUTES)[RouteKey];
