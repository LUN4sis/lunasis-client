'use server';

import type { ExchangeResponse } from '@repo/shared/features/auth';
import { googleLoginAPI, appleLoginAPI, logoutAPI } from '@repo/shared/features/auth/api/auth.api';
import { ErrorCode } from '@repo/shared/types';

interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
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
  try {
    // If name is provided, use Apple login API
    const data = name
      ? await appleLoginAPI(credential, name)
      : await googleLoginAPI(credential);

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: ErrorCode.EXCHANGE_FAILED,
        message: error instanceof Error ? error.message : 'Token exchange failed',
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
