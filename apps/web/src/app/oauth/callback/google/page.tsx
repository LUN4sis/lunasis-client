'use client';

import { ROUTES } from '@repo/shared/constants';
import { handleAndLogError, logger, safeSessionStorage } from '@repo/shared/utils';
import { LoadingFallback } from '@web/components/ui/loading-fallback';
import { useLogin } from '@web/features/auth/hooks/use-auth';
import { verifyOAuthState } from '@web/features/auth/utils';
import { routing } from '@web/i18n/routing';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const GoogleCallbackContent = () => {
  const searchParams = useSearchParams();
  const { login, isError, error } = useLogin();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const getLocale = (): 'ko' | 'en' => {
      const storedLocale = safeSessionStorage.getItem('oauth_locale');
      if (storedLocale && routing.locales.includes(storedLocale as 'ko' | 'en')) {
        return storedLocale as unknown as 'ko' | 'en';
      }
      return routing.defaultLocale;
    };

    const redirectToLogin = () => {
      if (typeof window === 'undefined') return;

      const locale = getLocale();
      const loginUrl = `${window.location.origin}/${locale}${ROUTES.LOGIN}`;
      window.location.href = loginUrl;
    };

    try {
      const code = searchParams.get('code');
      const oauthError = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const state = searchParams.get('state');

      // Log OAuth code for debugging (development only shows raw code)
      // 디버깅용 OAuth 코드 로그 (개발 환경에서만 원문 출력)
      if (code) {
        const isDev = process.env.NODE_ENV === 'development';
        const maskedCode =
          code.length <= 12
            ? `${code.slice(0, 2)}...${code.slice(-2)}`
            : `${code.slice(0, 6)}...${code.slice(-6)}`;

        console.log('[OAuth][Google] authorization code:', isDev ? code : maskedCode);
      }

      // Handle OAuth error from Google
      // Google에서 반환된 OAuth 에러 처리
      if (oauthError) {
        logger.error('[Auth] Google OAuth error', {
          error: oauthError,
          description: errorDescription,
        });
        setErrorMessage(errorDescription || 'Google authentication failed. Please try again.');

        setTimeout(() => {
          redirectToLogin();
        }, 3000);
        return;
      }

      // Verify state parameter for CSRF protection
      if (!verifyOAuthState(state)) {
        logger.error('[Auth] OAuth state verification failed - possible CSRF attack');
        setErrorMessage('Security verification failed. Please try logging in again.');

        setTimeout(() => {
          redirectToLogin();
        }, 3000);
        return;
      }

      // Process authorization code
      if (code) {
        logger.info('[Auth] Google OAuth code received, exchanging for tokens...');

        // Login hook will handle the redirect after successful login
        login({ code });
        return;
      }

      logger.warn('[Auth] No OAuth code found in URL');
      setErrorMessage('Invalid authentication response. Please try again.');

      setTimeout(() => {
        redirectToLogin();
      }, 3000);
    } catch (e) {
      const handledError = handleAndLogError(e, 'Google OAuth callback');
      logger.error('[Auth] Google OAuth callback crashed', handledError.toJSON());
      setErrorMessage('An unexpected error occurred during login. Please try again.');

      setTimeout(() => {
        redirectToLogin();
      }, 3000);
    }
  }, [searchParams, login]);

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

  return <LoadingFallback />;
};

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <GoogleCallbackContent />
    </Suspense>
  );
}
