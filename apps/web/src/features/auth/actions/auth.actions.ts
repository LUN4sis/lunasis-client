'use server';

import type { AuthSessionResponse } from '@repo/shared/features/auth';
import { appleLoginAPI, googleLoginAPI, logoutAPI } from '@repo/shared/features/auth/api/auth.api';
import { ErrorCode } from '@repo/shared/types';

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
  provider: 'google' | 'apple',
  name?: string,
): Promise<ApiResponse<AuthSessionResponse>> {
  logger.debug('[Server Action] exchangeAuthToken called', {
    hasCredential: !!credential,
    credentialLength: credential?.length,
    provider,
    hasName: !!name,
  });

  try {
    // Use provider to determine which API to call
    const data =
      provider === 'apple'
        ? await appleLoginAPI(credential, name ?? '')
        : await googleLoginAPI(credential);

    // Check if server returned an error response
    if (data && typeof data === 'object' && 'success' in data && data.success === false) {
      logger.warn(
        '[Server Action] Server returned error response',
        data as Record<string, unknown>,
      );
      return createErrorResponse(ErrorCode.EXCHANGE_FAILED, 'Token exchange failed');
    }

    // Validate required fields
    if (!data?.accessToken || !data?.refreshToken) {
      logger.warn('[Server Action] Missing required tokens in response');
      return createErrorResponse(
        ErrorCode.EXCHANGE_FAILED,
        'Invalid response from server: missing tokens',
      );
    }

    logger.debug('[Server Action] Token exchange successful');
    return createSuccessResponse(data);
  } catch (error) {
    handleError(error, 'exchangeAuthToken');
    return createErrorResponseFromUnknown(error);
  }
}

/**
 * Logout (Server Action)
 * Reuses logoutAPI from @repo/shared
 */
export async function logoutUser(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<ApiResponse<null>> {
  if (!accessToken && !refreshToken) {
    return createSuccessResponse(null);
  }

  if (!refreshToken) {
    return createErrorResponse(ErrorCode.VALIDATION_ERROR, 'Refresh token is required for logout');
  }

  try {
    await logoutAPI(refreshToken);
    return createSuccessResponse(null);
  } catch (error) {
    return createErrorResponseFromUnknown(error);
  }
}
