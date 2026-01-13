'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import {
  buildGoogleOAuthUrl,
  getOAuthCallbackUrl,
  buildAppleOAuthUrl,
  getAppleOAuthCallbackUrl,
} from '@web/features/auth/utils';
import { logger } from '@repo/shared/utils';
import { Button } from '@web/components/ui/button';

import clsx from 'clsx';
import styles from './login.module.scss';

/**
 * Login Page
 */
export default function LoginPage() {
  const params = useParams();
  const locale = params?.locale as string | undefined;
  const [error, setError] = useState<string | null>(null);

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

      window.location.href = googleAuthUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start login';
      logger.error('[Auth] Failed to build Google OAuth URL', {
        error: errorMessage,
      });
      setError(errorMessage);
    }
  };

  const handleAppleLogin = () => {
    try {
      setError(null);
      const redirectUri = getAppleOAuthCallbackUrl(locale);
      const appleAuthUrl = buildAppleOAuthUrl(redirectUri);

      logger.info('[Auth] Redirecting to Apple OAuth', {
        redirectUri,
        locale,
      });

      window.location.href = appleAuthUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start login';
      logger.error('[Auth] Failed to build Apple OAuth URL', {
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
        <Button
          onClick={handleGoogleLogin}
          className={clsx(styles.loginButton, styles.google)}
          type="button"
          aria-label="구글 로그인"
          variant="solid"
          colorScheme="white"
          fullWidth={true}
        >
          <Image src="/google.svg" alt="google" width={24} height={24} />
          <span>구글로 로그인</span>
        </Button>
        <Button
          onClick={handleAppleLogin}
          className={clsx(styles.loginButton, styles.apple)}
          type="button"
          variant="solid"
          colorScheme="white"
          fullWidth={true}
          aria-label="애플 로그인"
        >
          <Image src="/apple.svg" alt="apple" width={28} height={28} />
          <span>애플로 로그인</span>
        </Button>
      </section>
    </main>
  );
}
