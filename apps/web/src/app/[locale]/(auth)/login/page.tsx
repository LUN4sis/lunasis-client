'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { buildGoogleOAuthUrl, getOAuthCallbackUrl } from '@web/features/auth/utils';
import { logger } from '@repo/shared/utils';

import styles from './login.module.scss';

/**
 * Login Page
 */
export default function LoginPage() {
  const params = useParams();
  const locale = params?.locale as string | undefined;
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle Google login button click
   */
  const handleGoogleLogin = () => {
    try {
      setError(null);
      const redirectUri = getOAuthCallbackUrl(locale);
      const googleAuthUrl = buildGoogleOAuthUrl(redirectUri);

      logger.info('[Auth] Redirecting to Google OAuth', {
        redirectUri,
        locale,
        origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
        envRedirectUri: process.env.NEXT_PUBLIC_REDIRECT_URI,
      });

      console.group('[Auth Debug] Google OAuth Configuration');
      console.log('Environment REDIRECT_URI:', process.env.NEXT_PUBLIC_REDIRECT_URI);
      console.log('Actual Redirect URI used:', redirectUri);
      console.log('Current locale:', locale);
      console.log('Full OAuth URL:', googleAuthUrl);
      console.log('⚠️  Make sure this EXACT URI is registered in Google OAuth Console:');
      console.log('   ', redirectUri);
      console.groupEnd();

      window.location.href = googleAuthUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start login';
      logger.error('[Auth] Failed to build Google OAuth URL', {
        error: errorMessage,
      });
      setError(errorMessage);
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.logoContainer}>
        <Image src="/logo.png" alt="logo" width={140} height={150} priority />
        <span>LUNAsis</span>
      </section>
      <section className={styles.loginButtonContainer}>
        {error && (
          <div
            style={{
              color: '#ef4444',
              padding: '12px',
              marginBottom: '16px',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              fontSize: '14px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}
        <button
          onClick={handleGoogleLogin}
          className={styles.googleLoginButton}
          type="button"
          aria-label="구글 로그인"
        >
          <Image src="/google.svg" alt="google" width={24} height={24} />
          <span>구글로 로그인</span>
        </button>
      </section>
    </main>
  );
}
