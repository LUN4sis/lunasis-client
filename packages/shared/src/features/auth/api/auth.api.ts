import type { ApiResponse } from '@repo/shared/types';
import type { ExchangeResponse, RefreshTokenResponse } from '../types/auth.type';
import { logger, transformError } from '@repo/shared/utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Exchange OAuth code for tokens
 *
 * POST /sessions/exchange
 * Body: { exchangeToken: string }
 * Response: { success, message, code, data: { accessToken, refreshToken, ... } }
 */
export async function exchangeTokenAPI(code: string): Promise<ApiResponse<ExchangeResponse>> {
  const url = `${API_BASE_URL}/sessions/exchange`;
  const requestBody = { exchangeToken: code };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return data;
  } catch (error) {
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshTokenAPI(
  accessToken: string,
  refreshToken: string,
): Promise<ApiResponse<RefreshTokenResponse>> {
  const response = await fetch(`${API_BASE_URL}/sessions`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json();
}

/**
 * Logout user
 */
export async function logoutAPI(
  accessToken: string | null,
  refreshToken: string | null,
): Promise<void> {
  if (!accessToken && !refreshToken) {
    return;
  }

  try {
    await fetch(`${API_BASE_URL}/sessions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      },
      body: JSON.stringify({ refreshToken }),
    });
  } catch (error) {
    const appError = transformError(error);
    logger.error('[Auth] Logout failed:', appError.toJSON());
  }
}
