'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLogin } from '@web/features/auth/hooks/use-auth';
import { verifyOAuthState } from '@web/features/auth/utils';
import { logger } from '@repo/shared/utils';
import { LoadingFallback } from '@web/components/ui/loading-fallback';
import { ROUTES } from '@repo/shared/constants';
import { routing } from '@web/i18n/routing';

const AppleCallbackContent = () => {
  const searchParams = useSearchParams();
  const { login, isError } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');
    const name = searchParams.get('name') || '';

    const getLocale = (): 'ko' | 'en' => {
      if (typeof window !== 'undefined') {
        const storedLocale = sessionStorage.getItem('oauth_locale');
        if (storedLocale && routing.locales.includes(storedLocale as 'ko' | 'en')) {
          return storedLocale as unknown as 'ko' | 'en';
        }
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

    if (error) {
      logger.error('[Auth] Apple OAuth error', {
        error: error as string,
        description: errorDescription as string | null,
      });
      setErrorMessage(errorDescription || 'Apple authentication failed. Please try again.');

      setTimeout(() => {
        redirectToLogin();
      }, 3000);
      return;
    }

    if (!verifyOAuthState(state)) {
      logger.error('[Auth] OAuth state verification failed - possible CSRF attack');
      setErrorMessage('Security verification failed. Please try logging in again.');

      setTimeout(() => {
        redirectToLogin();
      }, 3000);
      return;
    }

    if (code) {
      logger.info('[Auth] Apple OAuth code received, exchanging for tokens...');

      login({ code, name });
    } else {
      logger.warn('[Auth] No OAuth code found in URL');
      setErrorMessage('Invalid authentication response. Please try again.');

      setTimeout(() => {
        redirectToLogin();
      }, 3000);
    }
  }, [searchParams, login]);

  if (errorMessage || isError) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ color: '#ef4444', marginBottom: '16px' }}>Authentication Failed</h2>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          {errorMessage || 'An error occurred during login. Please try again.'}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Redirecting to login page...</p>
      </div>
    );
  }

  return <LoadingFallback />;
};

export default function AppleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <AppleCallbackContent />
    </Suspense>
  );
}
