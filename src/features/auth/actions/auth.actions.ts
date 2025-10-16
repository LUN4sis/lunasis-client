'use server';

import { AppError, ErrorCode, ERROR_MESSAGES } from '@/types/error';
import type { ExchangeTokenResult } from '../types/auth.type';
import {
  createSuccessResponse,
  createErrorResponse,
  createErrorResponseFromAppError,
} from '@/lib/utils/server-action';
import { logger } from '@/lib/utils/logger';
import { exchangeTokenAPI, logoutAPI } from '../api/auth.api';

/**
 * Logout user from server
 * @param accessToken - Current access token
 * @param refreshToken - Current refresh token
 * @returns Logout result
 */
export async function logoutUser(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Early return: No tokens
    if (!accessToken && !refreshToken) {
      return { success: true };
    }

    await logoutAPI(accessToken, refreshToken);

    return { success: true };
  } catch (error) {
    logger.error('[Auth] Logout failed:', error instanceof AppError ? error.toJSON() : error);
    return { success: true, error: 'Server logout failed' };
  }
}

/**
 * Exchange OAuth authorization code for access token
 * @param exchangeToken - OAuth authorization code
 * @returns Exchange result (tokens and user information)
 */
export async function exchangeAuthToken(exchangeToken: string): Promise<ExchangeTokenResult> {
  try {
    // Early return: Validation
    if (!exchangeToken) {
      throw new AppError(ErrorCode.INVALID_CODE);
    }

    const data = await exchangeTokenAPI(exchangeToken);

    return createSuccessResponse(data);
  } catch (error) {
    // API layer already converted to AppError
    if (error instanceof AppError) {
      return createErrorResponseFromAppError(error);
    }

    // Fallback for unexpected errors
    return createErrorResponse(
      ErrorCode.UNKNOWN_ERROR,
      error instanceof Error ? error.message : ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR],
    );
  }
}
