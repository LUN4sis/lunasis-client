'use server';

import type { ExchangeResponse } from '@repo/shared/features/auth';
import { googleLoginAPI, appleLoginAPI, logoutAPI } from '@repo/shared/features/auth/api/auth.api';
import { ErrorCode } from '@repo/shared/types';
import { AxiosError } from 'axios';

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Exchange OAuth credential for tokens (Server Action)
 * Supports both Google and Apple OAuth
 * @param credential - OAuth authorization code
 * @param name - User name (required for Apple, optional for Google)
 */
export async function exchangeAuthToken(
  credential: string,
  name?: string,
): Promise<ActionResponse<ExchangeResponse>> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

  console.log('[Server Action] exchangeAuthToken called', {
    hasCredential: !!credential,
    credentialLength: credential?.length,
    hasName: !!name,
    apiUrl,
  });

  try {
    // If name is provided, use Apple login API
    const data = name ? await appleLoginAPI(credential, name) : await googleLoginAPI(credential);

    console.log('[Server Action] Token exchange successful', {
      hasData: !!data,
    });

    return {
      success: true,
      data,
    };
  } catch (error) {
    // Enhanced error logging for debugging
    // 디버깅을 위한 향상된 에러 로깅
    const isAxiosError = error instanceof AxiosError;
    const errorDetails = {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      isAxiosError,
      ...(isAxiosError && {
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        requestUrl: error.config?.url,
        requestBaseUrl: error.config?.baseURL,
      }),
    };

    console.error('[Server Action] Token exchange failed:', errorDetails);

    return {
      success: false,
      error: {
        code: ErrorCode.EXCHANGE_FAILED,
        message: error instanceof Error ? error.message : 'Token exchange failed',
        details: JSON.stringify(errorDetails),
      },
    };
  }
}

/**
 * Logout (Server Action)
 * Reuses logoutAPI from @repo/shared
 */
export async function logoutUser(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<{ success: boolean; error?: string }> {
  if (!accessToken && !refreshToken) {
    return { success: true };
  }

  if (!refreshToken) {
    return {
      success: false,
      error: 'Refresh token is required for logout',
    };
  }

  try {
    await logoutAPI(refreshToken);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Logout failed',
    };
  }
}
