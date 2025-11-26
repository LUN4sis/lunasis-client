'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../stores/use-auth-store';
import { shouldAutoLogout, getNextExpirationCheckDelay } from '../utils/token-manager';
import { logger } from '@repo/shared/utils';

/**
 * Monitor token expiration and auto-logout
 *
 * @param onLogout - callback function to perform logout
 */
export function useTokenExpiration(onLogout: () => void) {
  const { accessTokenIssuedAt, refreshTokenIssuedAt, isLoggedIn } = useAuthStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      onLogout?.();
      return;
    }

    logger.log('[TokenExpiration] Tokens valid');
  }, [accessTokenIssuedAt, refreshTokenIssuedAt, isLoggedIn, onLogout]);

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

    // calculate delay for next check
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
    checkAndHandleExpiration();
    scheduleNextCheck();

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
