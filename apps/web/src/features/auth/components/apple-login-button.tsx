'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Button } from '@web/components/ui/button';
import Image from 'next/image';
import { buildAppleOAuthUrl, getAppleOAuthCallbackUrl } from '@web/features/auth/utils';
import { logger } from '@repo/shared/utils';
import styles from './login-button.module.scss';

/**
 * Apple Login Button Component
 */
export function AppleLoginButton() {
  const t = useTranslations('login');
  const params = useParams();
  const locale = params?.locale as string | undefined;

  /**
   * Handle Apple login button click
   */
  const handleLogin = () => {
    try {
      const redirectUri = getAppleOAuthCallbackUrl(locale);
      const appleAuthUrl = buildAppleOAuthUrl(redirectUri);

      window.location.href = appleAuthUrl;
    } catch (error) {
      logger.error('[Auth] Failed to build Apple OAuth URL', {
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
      aria-label={t('appleLabel')}
    >
      <Image src="/apple.svg" alt="apple" width={24} height={24} />
      <span>{t('appleLabel')}</span>
    </Button>
  );
}
