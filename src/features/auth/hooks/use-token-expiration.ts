'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/use-auth-store';
import { logoutSync } from './use-auth';
import { shouldAutoLogout, getNextExpirationCheckDelay } from '../utils/token-manager';
import { logger } from '@/lib/utils/logger';

// monitor token expiration and auto-logout when necessary
export function useTokenExpiration() {
  const { accessTokenIssuedAt, refreshTokenIssuedAt, isLoggedIn } = useAuthStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // check token status and perform auto-logout if needed
  const checkAndHandleExpiration = useCallback(() => {
    // early return: user not logged in
    if (!isLoggedIn) {
      logger.log('[TokenExpiration] User not logged in, skipping check');
      return;
    }

    // check if auto-logout is required
    const shouldLogout = shouldAutoLogout(accessTokenIssuedAt, refreshTokenIssuedAt);

    if (shouldLogout) {
      logger.warn('[TokenExpiration] Refresh token expired, performing auto-logout');

      // perform synchronous logout
      logoutSync();

      return;
    }

    logger.log('[TokenExpiration] Tokens valid:', {
      accessTokenIssuedAt,
      refreshTokenIssuedAt,
      isLoggedIn,
    });
  }, [accessTokenIssuedAt, refreshTokenIssuedAt, isLoggedIn]);

  // schedule next expiration check
  const scheduleNextCheck = useCallback(() => {
    // clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // early return: user not logged in
    if (!isLoggedIn) {
      return;
    }

    // Calculate delay for next check
    const delay = getNextExpirationCheckDelay(accessTokenIssuedAt, refreshTokenIssuedAt);

    logger.log('[TokenExpiration] Scheduling next check in:', {
      delayMs: delay,
      delaySec: Math.round(delay / 1000),
    });

    // schedule next check
    timeoutRef.current = setTimeout(() => {
      checkAndHandleExpiration();
      scheduleNextCheck();
    }, delay);
  }, [accessTokenIssuedAt, refreshTokenIssuedAt, isLoggedIn, checkAndHandleExpiration]);

  // initialize and cleanup
  useEffect(() => {
    // perform initial check
    checkAndHandleExpiration();

    // schedule periodic checks
    scheduleNextCheck();

    // cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [checkAndHandleExpiration, scheduleNextCheck]);

  // re-schedule when token timestamps change
  useEffect(() => {
    scheduleNextCheck();
  }, [accessTokenIssuedAt, refreshTokenIssuedAt, scheduleNextCheck]);
}
