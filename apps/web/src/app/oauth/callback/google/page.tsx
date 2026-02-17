'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

import { ROUTES } from '@repo/shared/constants';
import { useAuthStore } from '@repo/shared/features/auth';
import { handleAndLogError, logger, safeSessionStorage } from '@repo/shared/utils';

import { LoadingFallback } from '@web/components/ui/loading-fallback';
import { useLogin } from '@web/features/auth/hooks/use-auth';
import { verifyOAuthState } from '@web/features/auth/utils';
import { routing } from '@web/i18n/routing';

const GoogleCallback = () => {
  const { clearAuth } = useAuthStore();
  const searchParams = useSearchParams();
  const hasProcessedRef = useRef(false);

  const getLocale = (): 'ko' | 'en' => {
    const storedLocale = safeSessionStorage.getItem('oauth_locale');

    if (storedLocale && routing.locales.includes(storedLocale as 'ko' | 'en')) {
      return storedLocale as unknown as 'ko' | 'en';
    }
    return routing.defaultLocale;
  };

  const redirectToLogin = () => {
    if (typeof window !== 'undefined') {
      const locale = getLocale();
      const loginUrl = `${window.location.origin}/${locale}${ROUTES.LOGIN}`;
      window.location.href = loginUrl;
    }
  };

  // pass redirectToLogin as error callback for immediate redirect
  const { login } = useLogin({ onErrorCallback: redirectToLogin });

  useEffect(() => {
    if (hasProcessedRef.current) return;

    try {
      const code = searchParams.get('code');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const state = searchParams.get('state');

      if (error) {
        logger.error('[Auth] Google OAuth error, redirecting immediately', {
          error: error as string,
          description: errorDescription as string | null,
        });

        // clear auth state on OAuth error
        clearAuth();
        redirectToLogin();
        return;
      }

      if (!verifyOAuthState(state)) {
        logger.error('[Auth] OAuth state verification failed - redirecting immediately');

        // clear auth state on security error
        clearAuth();
        redirectToLogin();
        return;
      }

      if (code) {
        logger.info('[Auth] Google OAuth code received, exchanging for tokens...');

        // mark as processed before async operation
        hasProcessedRef.current = true;

        login({ code });
        return;
      }

      logger.warn('[Auth] No OAuth code found in URL, redirecting immediately');

      // clear auth state on invalid response
      clearAuth();
      redirectToLogin();
    } catch (e) {
      const handledError = handleAndLogError(e, 'Google OAuth callback');
      logger.error(
        '[Auth] Google OAuth callback crashed, redirecting immediately',
        handledError.toJSON(),
      );
    }
  }, [searchParams, login]);

  // always show loading while processing
  return <LoadingFallback />;
};

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallback />
    </Suspense>
  );
}
