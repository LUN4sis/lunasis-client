'use client';

import { ROUTES } from '@repo/shared/constants';
import { Button } from '@web/components/ui/button';
import Image from 'next/image';
import styles from './login-button.module.scss';

export function LoginButton() {
  const handleLogin = () => {
    window.location.href = ROUTES.OAUTH_REDIRECT;
  };

  return (
    <Button
      onClick={handleLogin}
      className={styles.loginButton}
      variant="outline"
      colorScheme="white"
      fullWidth={true}
    >
      <Image src="/google.svg" alt="google" width={24} height={24} />
      <span>Start with Google</span>
    </Button>
  );
}
