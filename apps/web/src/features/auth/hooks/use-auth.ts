'use client';

import { useParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@repo/shared/features/auth';
import { exchangeAuthToken } from '../actions/auth.actions';
import { logoutManager } from '../utils';

import { ROUTES } from '@repo/shared/constants';
import { logger, transformError } from '@repo/shared/utils';
import { AppError, ErrorCode, ERROR_MESSAGES } from '@repo/shared/types';
import type { ExchangeResponse } from '@repo/shared/features/auth/types';
import { routing } from '@web/i18n/routing';

const STATE_UPDATE_DELAY = 200;

/**
 * Hook for handling user logout with React Query
 *
 * Uses LogoutManager for consistent logout behavior
 */
export function useLogout() {
  const params = useParams();
  const { accessToken, refreshToken } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutManager.completeLogout(accessToken, refreshToken);
    },
    onSettled: () => {
      if (typeof window !== 'undefined') {
        // Get locale from params or use default
        const locale = (params?.locale as string) || routing.defaultLocale;
        const redirectUrl = `${window.location.origin}/${locale}${ROUTES.ROOT}`;
        window.location.href = redirectUrl;
      }
    },
  });

  return {
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}

/**
 * Synchronous logout for emergency cases (e.g., interceptor)
 */
export function logoutSync() {
  logoutManager.logoutSync();
}

/**
 * Hook for handling OAuth login/token exchange with React Query
 */
export function useLogin() {
  const { updateTokens, setProfile } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (code: string) => {
      const result = await exchangeAuthToken(code);

      // Validate result
      if (!result.success || !result.data) {
        const errorCode = (result.error?.code as ErrorCode) || ErrorCode.EXCHANGE_FAILED;
        const errorMessage = result.error?.message || ERROR_MESSAGES[errorCode];
        throw new AppError(errorCode, errorMessage);
      }

      return result.data;
    },
    onSuccess: async (data: ExchangeResponse) => {
      updateTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      setProfile({
        firstLogin: data.firstLogin,
        nickname: data.nickname,
        privateChat: data.privateChat,
      });

      // wait for Zustand persist to complete
      await new Promise((resolve) => setTimeout(resolve, STATE_UPDATE_DELAY));

      // Get locale from sessionStorage (stored before OAuth redirect)
      const getLocale = (): 'ko' | 'en' => {
        if (typeof window !== 'undefined') {
          const storedLocale = sessionStorage.getItem('oauth_locale');
          if (storedLocale) {
            sessionStorage.removeItem('oauth_locale');
            return storedLocale as 'ko' | 'en';
          }
        }
        return 'en'; // default locale
      };

      // Use window.location.href for reliable redirect from OAuth callback page
      // (which is outside [locale] group)
      if (typeof window !== 'undefined') {
        const locale = getLocale();
        const redirectPath = data.firstLogin ? ROUTES.ONBOARDING_NAME : ROUTES.ROOT;
        const redirectUrl = `${window.location.origin}/${locale}${redirectPath}`;
        window.location.href = redirectUrl;
      }
    },
    onError: (error: unknown) => {
      const appError = error instanceof AppError ? error : transformError(error);
      logger.error('[Auth] Login failed:', appError.toJSON());
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isError: loginMutation.isError,
  };
}

/**
 * Hook for checking authentication status
 */
export function useAuthStatus() {
  const { isLoggedIn, accessToken, refreshToken, nickname } = useAuthStore();

  return {
    isLoggedIn,
    isAuthenticated: isLoggedIn && !!accessToken,
    hasRefreshToken: !!refreshToken,
    nickname,
  };
}
