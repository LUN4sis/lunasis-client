import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from '@repo/shared/constants';

const protectedPaths = [
  ROUTES.ROOT,
  ROUTES.ONBOARDING_NAME,
  ROUTES.ONBOARDING_AGE,
  ROUTES.ONBOARDING_INTERESTS,
];

// paths that require authentication after login
const authPaths = [ROUTES.OAUTH_REDIRECT];

// OAuth callback path
const callbackPaths = [ROUTES.OAUTH_CALLBACK];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // OAuth callback is always allowed
  if (callbackPaths.some((path) => pathname.startsWith(path))) return NextResponse.next();

  // protected paths: allow client-side authentication check
  if (protectedPaths.some((path) => pathname.startsWith(path))) return NextResponse.next();

  // authentication paths: already logged in users are redirected to home
  // (actual check is performed on the client side)
  if (authPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

// set the paths that the middleware will run on
export const config = {
  matcher: [
    /*
     * run on all paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
};
