import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';
import { useAuthStore } from '@/features/auth';
import { ErrorCode, SERVER_ERROR_MESSAGES } from '@lunasis/shared/types';
import { handleApiError } from '@lunasis/shared/utils';
import { toTokens } from '@/features/auth';
import { isAuthError } from '@/features/auth';
import { logoutSync } from '@/features/auth';
import { refreshTokenAPI } from '@/features/auth';

// Token refresh state
let isRefreshingToken = false;
let pendingRequests: ((newToken: string) => void)[] = [];

/**
 * Resolve all pending requests with new token
 */
const resolvePending = (newToken: string) => {
  pendingRequests.forEach((cb) => cb(newToken));
  pendingRequests = [];
};

/**
 * Enqueue request to wait for token refresh
 */
const enqueuePendingRequest = (cb: (newToken: string) => void) => {
  pendingRequests.push(cb);
};

const getBaseURL = (): string => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
  }
  return '/api';
};

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// request interceptor
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    } as AxiosRequestHeaders;
  }

  return config;
});

// response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const request = error.config as AxiosRequestConfig & { retried?: boolean };
    const auth = useAuthStore.getState();

    const status = error.response?.status;
    const message = (error.response?.data as { message: string })?.message;

    // Access token expired -> use refresh token
    const isAccessExpired =
      status === 404 && message === SERVER_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED;

    if (isAccessExpired && !request.retried && auth.refreshToken) {
      // Wait if already refreshing
      if (isRefreshingToken) {
        return new Promise((resolve) => {
          enqueuePendingRequest((newToken) => {
            request.headers!.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(request));
          });
        });
      }

      // Handle initial expiration
      request.retried = true;
      isRefreshingToken = true;

      try {
        const data = await refreshTokenAPI(auth.accessToken ?? '', auth.refreshToken);

        // Update tokens (keep existing refreshToken if not provided)
        const tokens = toTokens(data, auth.refreshToken);
        useAuthStore.getState().updateTokens(tokens);

        // accessToken is always present (guaranteed by API response)
        const accessToken = tokens.accessToken!;

        // Process pending requests
        isRefreshingToken = false;
        resolvePending(accessToken);

        // Retry original request
        request.headers!.Authorization = `Bearer ${accessToken}`;
        return apiClient(request);
      } catch (refreshError) {
        // Logout on token refresh failure
        isRefreshingToken = false;
        logoutSync();

        // Use centralized error handler
        const appError = handleApiError(refreshError, ErrorCode.REFRESH_TOKEN_EXPIRED);
        return Promise.reject(appError);
      }
    }

    // Use centralized error handler for all other errors
    const appError = handleApiError(error);

    // Force logout for auth-related errors
    if (
      (status === 403 || status === 404) &&
      isAuthError(appError.code) &&
      (auth.accessToken || auth.refreshToken)
    ) {
      logoutSync();
    }

    return Promise.reject(appError);
  },
);

export { apiClient };
