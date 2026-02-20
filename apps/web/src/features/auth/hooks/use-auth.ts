'use client';

import { ROUTES } from '@repo/shared/constants';
import { useAuthStore } from '@repo/shared/features/auth';
import type { AuthSessionResponse } from '@repo/shared/features/auth/types';
import { AppError, ERROR_MESSAGES, ErrorCode } from '@repo/shared/types';
import { logger, transformError } from '@repo/shared/utils';
import { useMutation } from '@tanstack/react-query';
import { routing } from '@web/i18n/routing';
import { useParams } from 'next/navigation';

import { exchangeAuthToken } from '../actions/auth.actions';
import { logoutManager } from '../utils';

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

interface LoginParams {
  code: string;
  provider: 'google' | 'apple';
  name?: string;
}

interface UseLoginOptions {
  onErrorCallback?: () => void;
}

// Supported locales for login redirect (avoid importing next-intl in hook)
const LOGIN_SUPPORTED_LOCALES = ['ko', 'en'] as const;
const LOGIN_DEFAULT_LOCALE = 'ko';

/**
 * Hook for handling OAuth login/token exchange with React Query
 * Supports both Google and Apple OAuth
 *
 * OAuth 로그인/토큰 교환을 React Query로 처리하는 훅
 * Google 및 Apple OAuth 지원
 */
export function useLogin(options?: UseLoginOptions) {
  const { updateTokens, setProfile, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: async ({ code, provider, name }: LoginParams) => {
      logger.info('[Auth] Starting token exchange...', {
        provider,
        hasName: !!name,
        codeLength: code?.length,
      });

      const result = await exchangeAuthToken(code, provider, name);

      logger.info('[Auth] Token exchange result received', {
        success: result.success,
        hasData: !!result.data,
        errorCode: result.error?.code,
      });

      // Validate result / 결과 검증
      if (!result.success) {
        const errorCode = (result.error?.code as ErrorCode) || ErrorCode.EXCHANGE_FAILED;
        const errorMessage = result.error?.message || ERROR_MESSAGES[errorCode];

        logger.error('[Auth] Token exchange failed', {
          errorCode,
          errorMessage,
          originalError: result.error,
        });

        throw new AppError(errorCode, errorMessage);
      }

      // Validate data exists / 데이터 존재 확인
      if (!result.data) {
        logger.error('[Auth] Token exchange succeeded but no data returned');
        throw new AppError(ErrorCode.EXCHANGE_FAILED, 'No data returned from server');
      }

      return result.data;
    },
    onSuccess: async (data: AuthSessionResponse) => {
      logger.info('[Auth] Login successful, updating tokens...', {
        firstLogin: data.firstLogin,
        hasNickname: !!data.nickname,
        hasAccessToken: !!data.accessToken,
        hasRefreshToken: !!data.refreshToken,
      });

      // Double-check tokens are not empty (safety measure)
      // 토큰이 비어있지 않은지 재확인 (안전장치)
      if (!data.accessToken || !data.refreshToken) {
        logger.error('[Auth] Received empty tokens from server (unexpected)', {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });

        clearAuth();

        // Call error callback before throwing (for immediate redirect)
        if (options?.onErrorCallback) {
          logger.info('[Auth] Calling onErrorCallback before throwing error');
          options.onErrorCallback();
        }

        throw new AppError(ErrorCode.EXCHANGE_FAILED, 'Invalid tokens received from server');
      }

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
          try {
            const storedLocale = sessionStorage.getItem('oauth_locale');
            if (
              storedLocale &&
              LOGIN_SUPPORTED_LOCALES.includes(
                storedLocale as (typeof LOGIN_SUPPORTED_LOCALES)[number],
              )
            ) {
              sessionStorage.removeItem('oauth_locale');
              return storedLocale as 'ko' | 'en';
            }
          } catch (e) {
            logger.warn('[Auth] Failed to get locale from sessionStorage', {
              error: e instanceof Error ? e.message : String(e),
            });
          }
        }
        return LOGIN_DEFAULT_LOCALE;
      };

      // Use window.location.href for reliable redirect from OAuth callback page
      // (which is outside [locale] group)
      if (typeof window !== 'undefined') {
        const locale = getLocale();
        const redirectPath = data.firstLogin ? ROUTES.ONBOARDING_NAME : ROUTES.ROOT;
        const redirectUrl = `${window.location.origin}/${locale}${redirectPath}`;

        logger.info('[Auth] Redirecting after login', {
          locale,
          redirectPath,
          firstLogin: data.firstLogin,
        });

        window.location.href = redirectUrl;
      }
    },
    onError: (error: unknown) => {
      const appError = error instanceof AppError ? error : transformError(error);
      logger.error('[Auth] Login failed', {
        code: appError.code,
        message: appError.message,
        statusCode: appError.statusCode,
        details: appError.details,
        // Log full error for debugging
        // 디버깅을 위한 전체 에러 로그
        fullError: error instanceof Error ? error.stack : String(error),
      });

      // Also log to console for Vercel logs visibility
      console.error('[Auth] Login error details:', {
        error,
        appError: {
          code: appError.code,
          message: appError.message,
          details: appError.details,
        },
      });

      clearAuth();

      if (options?.onErrorCallback) {
        logger.info('[Auth] Calling onErrorCallback for immediate redirect');
        options.onErrorCallback();
      }
    },
  });

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isError: loginMutation.isError,
    error: loginMutation.error,
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
