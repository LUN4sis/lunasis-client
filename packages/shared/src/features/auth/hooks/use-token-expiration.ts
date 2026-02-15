'use client';

import { useCallback, useEffect, useRef } from 'react';

import { logger } from '@repo/shared/utils';

import { useAuthStore } from '../stores/use-auth-store';
import { getNextExpirationCheckDelay, shouldAutoLogout } from '../utils/token-manager';

/**
 * Monitor token expiration and auto-logout
 *
 * @param onLogout - callback function to perform logout
 */
export function useTokenExpiration(onLogout: () => void) {
  const { accessTokenIssuedAt, refreshTokenIssuedAt, isLoggedIn } = useAuthStore();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onLogoutRef = useRef(onLogout);

  useEffect(() => {
    onLogoutRef.current = onLogout;
  }, [onLogout]);

  const checkAndHandleExpiration = useCallback(() => {
    logger.info('[TokenExpiration] Checking token expiration', {
      accessTokenIssuedAt,
      refreshTokenIssuedAt,
      isLoggedIn,
    });
    // early return: user not logged in
    if (!isLoggedIn) {
      logger.info('[TokenExpiration] User not logged in, skipping check');
      return;
    }

    // check if auto-logout is required
    const shouldLogout = shouldAutoLogout(accessTokenIssuedAt, refreshTokenIssuedAt);

    if (shouldLogout) {
      logger.warn('[TokenExpiration] Refresh token expired, performing auto-logout');
      onLogoutRef.current();
      return;
    }

    logger.info('[TokenExpiration] Tokens valid');
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

    // calculate delay for next check
    const delay = getNextExpirationCheckDelay(accessTokenIssuedAt, refreshTokenIssuedAt);

    logger.info('[TokenExpiration] Scheduling next check in:', {
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
        timeoutRef.current = null;
      }
    };
  }, [checkAndHandleExpiration, scheduleNextCheck]);
}
