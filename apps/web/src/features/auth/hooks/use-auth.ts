'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@lunasis/shared/stores';
import { logoutUser, exchangeAuthToken } from '../actions/auth.actions';
import { ROUTES } from '@lunasis/shared/constants';
import type { ExchangeResponse } from '@lunasis/shared/types';
import { AppError, ErrorCode, ERROR_MESSAGES } from '@lunasis/shared/types';

const STATE_UPDATE_DELAY = 200;

/**
 * Hook for handling user logout with React Query
 */
export function useLogout() {
  const router = useRouter();
  const { accessToken, refreshToken, clearAuth } = useAuthStore();

  const logoutMutation = useMutation({
    mutationFn: () => logoutUser(accessToken, refreshToken),
    onSettled: () => {
      clearAuth();
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
 * Clears local state immediately and attempts server logout in background
 */
export function logoutSync() {
  const { accessToken, refreshToken, clearAuth } = useAuthStore.getState();

  if (accessToken || refreshToken) {
    logoutUser(accessToken, refreshToken).catch(() => {});
  }

  clearAuth();
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
        const errorCode = result.error?.code || ErrorCode.EXCHANGE_FAILED;
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

      await new Promise((resolve) => setTimeout(resolve, STATE_UPDATE_DELAY));

      const redirectPath = data.firstLogin ? ROUTES.ONBOARDING_NAME : ROUTES.ROOT;
      router.replace(redirectPath);
    },
    onError: (error: unknown) => {
      // Log error for debugging
      if (error instanceof AppError) {
        console.error('[Auth] Login failed:', error.toJSON());
      } else {
        console.error('[Auth] Login failed:', error);
      }
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
