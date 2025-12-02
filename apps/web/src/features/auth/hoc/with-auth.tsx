'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, ComponentType, ReactNode } from 'react';
import { useAuthStore } from '@repo/shared/features/auth';
import { logger } from '@repo/shared/utils';
import { ErrorCode, ERROR_MESSAGES } from '@repo/shared/types';

import styles from './with-auth.module.scss';

/**
 * Default fallback component for loading state
 */
const DefaultLoadingFallback = () => (
  <div className={styles.container}>
    <div className={styles.content}>
      <p className={styles.message}>Loading...</p>
    </div>
  </div>
);

/**
 * Default fallback component for unauthorized state
 */
const DefaultUnauthorizedFallback = () => (
  <div className={styles.container}>
    <div className={styles.content}>
      <h2 className={styles.title}>{ERROR_MESSAGES[ErrorCode.AUTH_REQUIRED]}</h2>
      <p className={styles.message}>Redirecting to login page...</p>
    </div>
  </div>
);

export interface WithAuthOptions {
  loadingFallback?: ReactNode;
  unauthorizedFallback?: ReactNode;
}

/**
 * Protect routes with authentication
 */
export function withAuth<P extends object>(Component: ComponentType<P>, options?: WithAuthOptions) {
  const WrappedComponent = (props: P) => {
    const router = useRouter();
    const { isLoggedIn, accessToken } = useAuthStore();
    const [isHydrated, setIsHydrated] = useState(false);

    // Wait for zustand persist hydration
    useEffect(() => {
      setIsHydrated(true);
    }, []);

    // Check authentication and redirect if needed
    useEffect(() => {
      if (!isHydrated) return;

      if (!isLoggedIn && !accessToken) {
        logger.warn('[withAuth] Unauthorized, redirecting to home');
        router.replace(`/?error=${ErrorCode.AUTH_REQUIRED}`);
        return;
      }

      logger.info('[withAuth] Authenticated, rendering page');
    }, [isHydrated, isLoggedIn, accessToken, router]);

    // Show loading until hydration is complete
    if (!isHydrated) {
      return <>{options?.loadingFallback ?? <DefaultLoadingFallback />}</>;
    }

    // Show unauthorized fallback while redirecting
    if (!isLoggedIn && !accessToken) {
      return <>{options?.unauthorizedFallback ?? <DefaultUnauthorizedFallback />}</>;
    }

    // Render the protected component
    return <Component {...props} />;
  };

  // Set display name for better debugging
  WrappedComponent.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;

  return WrappedComponent;
}

// Export default for backward compatibility (optional)
export default withAuth;
