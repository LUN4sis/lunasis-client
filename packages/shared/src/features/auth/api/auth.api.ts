import { createApiClient } from '@repo/shared/api';

import type { AuthSessionResponse, RefreshTokenResponse } from '../types';

const API_BASE_URL =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8080/api';

/**
 * Google Login API
 * POST /api/auth/google
 * @request body {loginCode: string}
 * @response {LoginResponse}
 */
export const googleLoginAPI = async (loginCode: string): Promise<AuthSessionResponse> => {
  const api = createApiClient({ baseURL: API_BASE_URL, unwrapData: true });
  return await api.post<AuthSessionResponse, { loginCode: string }>('/auth/google', { loginCode });
};

export const appleLoginAPI = async (
  loginCode: string,
  name: string,
): Promise<AuthSessionResponse> => {
  const api = createApiClient({ baseURL: API_BASE_URL, unwrapData: true });
  return await api.post<AuthSessionResponse, { loginCode: string; name: string }>('/auth/apple', {
    loginCode,
    name,
  });
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
  const api = createApiClient({ baseURL: API_BASE_URL, unwrapData: true });
  return await api.patch<RefreshTokenResponse, { refreshToken: string }>('/auth', { refreshToken });
};

/**
 * Alias for backward compatibility
 */
export const refreshTokenAPI: (
  accessToken: string,
  refreshToken: string,
) => Promise<RefreshTokenResponse> = tokenRefreshAPI;

/**
 * Logout API
 * DELETE /api/auth
 * @reqeust body {refreshToken: string}
 */
export const logoutAPI = async (refreshToken: string): Promise<{ success: boolean }> => {
  const api = createApiClient({ baseURL: API_BASE_URL });
  return await api.delete<{ success: boolean }>('/auth', { data: { refreshToken } });
};
