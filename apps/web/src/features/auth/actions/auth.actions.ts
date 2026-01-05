'use server';

import type { ExchangeResponse } from '@repo/shared/features/auth';
import { googleLoginAPI, logoutAPI } from '@repo/shared/features/auth/api/auth.api';
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
 * Exchange Google OAuth credential for tokens (Server Action)
 * Uses Google OAuth code from @react-oauth/google
 */
export async function exchangeAuthToken(
  credential: string,
): Promise<ActionResponse<ExchangeResponse>> {
  try {
    const data = await googleLoginAPI(credential);

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
