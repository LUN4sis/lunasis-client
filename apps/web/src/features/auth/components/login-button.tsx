'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@web/components/ui/button';
import Image from 'next/image';
import { buildGoogleOAuthUrl, getOAuthCallbackUrl } from '@web/features/auth/utils';
import { logger } from '@repo/shared/utils';
import styles from './login-button.module.scss';

/**
 * Google Login Button Component
 */
export function LoginButton() {
  const t = useTranslations('login');
  const params = useParams();
  const locale = params?.locale as string | undefined;

  /**
   * Handle Google login button click
   */
  const handleLogin = () => {
    try {
      const redirectUri = getOAuthCallbackUrl(locale);
      const googleAuthUrl = buildGoogleOAuthUrl(redirectUri);

      window.location.href = googleAuthUrl;
    } catch (error) {
      logger.error('[Auth] Failed to build Google OAuth URL', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  };

  return (
    <Button
      onClick={handleLogin}
      className={styles.loginButton}
      variant="outline"
      colorScheme="white"
      fullWidth={true}
      aria-label={t('label')}
    >
      <Image src="/google.svg" alt="google" width={24} height={24} />
      <span>{t('label')}</span>
    </Button>
  );
}
