'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@repo/shared/features/auth';
import { exchangeAuthToken } from '../actions/auth.actions';
import { logoutManager } from '../utils';

import { ROUTES } from '@repo/shared/constants';
import { logger, transformError } from '@repo/shared/utils';
import { AppError, ErrorCode, ERROR_MESSAGES } from '@repo/shared/types';
import type { ExchangeResponse } from '@repo/shared/features/auth/types';

const STATE_UPDATE_DELAY = 200;

/**
 * Hook for handling user logout with React Query
 *
 * Uses LogoutManager for consistent logout behavior
 */
export function useLogout() {
  const router = useRouter();
  const { accessToken, refreshToken } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutManager.completeLogout(accessToken, refreshToken);
    },
    onSettled: () => {
      router.push(ROUTES.ROOT);
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
  const router = useRouter();

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

      // redirect
      const redirectPath = data.firstLogin ? ROUTES.ONBOARDING_NAME : ROUTES.ROOT;
      router.replace(redirectPath);
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
