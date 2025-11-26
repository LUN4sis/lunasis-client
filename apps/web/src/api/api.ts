import { BaseApi, getApiUrl } from '@repo/shared/api/base.api';
import { useAuthStore } from '@repo/shared/features/auth';
import { refreshTokenAPI } from '@repo/shared/features/auth/api/auth.api';
import { toTokens } from '@repo/shared/features/auth/types/auth.type';
import { ErrorCode } from '@repo/shared/types';
import { isAuthError } from '@repo/shared/features/auth/constants/auth.constants';
import { API_CONFIG } from '@repo/shared/constants/config';
import { logoutSync } from '@web/features/auth/hooks/use-auth';

export const api = new BaseApi({
  baseURL: getApiUrl(),
  timeout: API_CONFIG.timeout,
  unwrapData: false,

  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onTokenRefresh: async (accessToken, refreshToken) => {
    const response = await refreshTokenAPI(accessToken, refreshToken);
    const tokens = toTokens(response, refreshToken);

    return {
      accessToken: tokens.accessToken!,
      refreshToken: tokens.refreshToken ?? undefined,
    };
  },

  onTokenUpdate: (accessToken, refreshToken) => {
    const currentRefreshToken = useAuthStore.getState().refreshToken;

    useAuthStore.getState().updateTokens({
      accessToken,
      refreshToken: refreshToken ?? currentRefreshToken ?? '',
    });
  },

  onLogout: () => {
    logoutSync();
  },

  isAuthError: (errorCode) => {
    return isAuthError(errorCode as ErrorCode);
  },
});

/**
 * 기존 코드 호환
 * TODO: 삭제 예정
 *
 * @deprecated use 'api' instead
 */
export { api as apiClient };
export default api;
