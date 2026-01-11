import type { LoginResponse, RefreshTokenResponse } from '../types/auth.type';
import { createApiClient } from '@repo/shared/api';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8080/api';

/**
 * Google Login API
 * POST /api/auth/google
 * @request body {loginCode: string}
 * @response {LoginResponse}
 */
export const googleLoginAPI = async (loginCode: string): Promise<LoginResponse> => {
  const api = createApiClient({ baseURL: API_BASE_URL, unwrapData: true });
  return await api.post<LoginResponse, { loginCode: string }>('/auth/google', { loginCode });
};

/**
 * Alias for backward compatibility
 */
export const exchangeTokenAPI = googleLoginAPI;

/**
 * Token Refresh API
 * PATCH /api/auth
 * @header {Authorization: Bearer <accessToken>}
 * @request body {refreshToken: string}
 * @response {RefreshTokenResponse}
 */
export const tokenRefreshAPI = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  const api = createApiClient({ baseURL: API_BASE_URL });
  return await api.patch<RefreshTokenResponse, { refreshToken: string }>('/auth', { refreshToken });
};

/**
 * Alias for backward compatibility
 */
export const refreshTokenAPI = tokenRefreshAPI;

/**
 * Logout API
 * DELETE /api/auth
 * @param refreshToken - Refresh token to invalidate
 * @request body {refreshToken: string}
 * @response {success: boolean}
 */
export const logoutAPI = async (refreshToken: string): Promise<{ success: boolean }> => {
  const api = createApiClient({
    baseURL: API_BASE_URL,
  });
  return await api.delete<{ success: boolean }>('/auth', { data: { refreshToken } });
};
