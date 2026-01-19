'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLogin } from '@web/features/auth/hooks/use-auth';
import { verifyOAuthState } from '@web/features/auth/utils';
import { logger } from '@repo/shared/utils';
import { Loading } from '@web/components/ui/loading';
import { ROUTES } from '@repo/shared/constants';
import { routing } from '@web/i18n/routing';

const GoogleCallbackContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, isError, error } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    // Get locale from sessionStorage (stored before OAuth redirect)
    // sessionStorage에서 로케일 가져오기 (OAuth 리다이렉트 전에 저장됨)
    const getLocale = (): 'ko' | 'en' => {
      if (typeof window !== 'undefined') {
        const storedLocale = sessionStorage.getItem('oauth_locale');
        if (storedLocale && routing.locales.includes(storedLocale as 'ko' | 'en')) {
          return storedLocale as unknown as 'ko' | 'en';
        }
      }
      return routing.defaultLocale;
    };

    // Handle OAuth error from Google
    // Google에서 반환된 OAuth 에러 처리
    if (oauthError) {
      logger.error('[Auth] Google OAuth error', {
        error: oauthError,
        description: errorDescription,
      });
      setErrorMessage(errorDescription || 'Google authentication failed. Please try again.');

      setTimeout(() => {
        const locale = getLocale();
        router.replace(`/${locale}${ROUTES.LOGIN}`);
      }, 3000);
      return;
    }

    // Verify state parameter for CSRF protection
    if (!verifyOAuthState(state)) {
      logger.error('[Auth] OAuth state verification failed - possible CSRF attack');
      setErrorMessage('Security verification failed. Please try logging in again.');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        const locale = getLocale();
        router.replace(`/${locale}${ROUTES.LOGIN}`);
      }, 3000);
      return;
    }

    // Process authorization code
    if (code) {
      logger.info('[Auth] Google OAuth code received, exchanging for tokens...');

      // Login hook will handle the redirect after successful login
      login({ code });
    } else {
      logger.warn('[Auth] No OAuth code found in URL');
      setErrorMessage('Invalid authentication response. Please try again.');

      // Redirect to login after 3 seconds
      setTimeout(() => {
        const locale = getLocale();
        router.replace(`/${locale}${ROUTES.LOGIN}`);
      }, 3000);
    }
  }, [searchParams, login, router]);

  // Show error message if authentication failed
  if (errorMessage || isError) {
    // Get error details for debugging
    // 디버깅을 위한 에러 상세 정보 가져오기
    const errorDetails =
      error instanceof Error ? error.message : error ? JSON.stringify(error) : null;

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
        {/* Show error details in development for debugging */}
        {/* 디버깅을 위해 개발 환경에서 에러 상세 정보 표시 */}
        {errorDetails && (
          <details style={{ marginBottom: '16px', maxWidth: '400px' }}>
            <summary style={{ color: '#9ca3af', fontSize: '12px', cursor: 'pointer' }}>
              Error Details (for debugging)
            </summary>
            <pre
              style={{
                color: '#9ca3af',
                fontSize: '10px',
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                background: '#1f2937',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '8px',
              }}
            >
              {errorDetails}
            </pre>
          </details>
        )}
        <p style={{ color: '#9ca3af', fontSize: '14px' }}>Redirecting to login page...</p>
      </div>
    );
  }

  return <Loading />;
};

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<Loading />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
