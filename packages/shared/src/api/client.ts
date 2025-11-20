import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { API_CONFIG } from '../constants/config';

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  getAccessToken?: () => string | null;
  onTokenRefresh?: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<{ accessToken: string; refreshToken?: string }>;
  onTokenUpdate?: (accessToken: string, refreshToken?: string) => void;
  onLogout?: () => void;
  isAuthError?: (errorCode: string) => boolean;
}

export function getApiUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side
    if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
      return process.env.NEXT_PUBLIC_API_URL;
    }
    return 'http://localhost:8080/api';
  }
  // Client-side
  return '/api';
}

export function createApiClient(config: ApiClientConfig): AxiosInstance {
  const client = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout ?? API_CONFIG.timeout,
    headers: {
      'Content-Type': 'application/json',
      ...config.headers,
    },
  });

  // Token refresh state
  let isRefreshingToken = false;
  let pendingRequests: ((newToken: string) => void)[] = [];

  const resolvePending = (newToken: string) => {
    pendingRequests.forEach((cb) => cb(newToken));
    pendingRequests = [];
  };

  const enqueuePendingRequest = (cb: (newToken: string) => void) => {
    pendingRequests.push(cb);
  };

  // Request interceptor - 토큰 추가
  client.interceptors.request.use((requestConfig) => {
    const token = config.getAccessToken?.();

    if (token) {
      requestConfig.headers.Authorization = `Bearer ${token}`;
    }

    return requestConfig;
  });

  // Response interceptor - 에러 처리 및 토큰 갱신
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const request = error.config as AxiosRequestConfig & { retried?: boolean };
      const status = error.response?.status;

      // 401 Unauthorized - 토큰 갱신 시도
      if (status === 401 && !request.retried && config.onTokenRefresh) {
        const accessToken = config.getAccessToken?.();
        const refreshToken = config.getAccessToken?.();

        if (accessToken && refreshToken) {
          // If already refreshing, wait
          if (isRefreshingToken) {
            return new Promise((resolve) => {
              enqueuePendingRequest((newToken) => {
                request.headers!.Authorization = `Bearer ${newToken}`;
                resolve(client(request));
              });
            });
          }

          request.retried = true;
          isRefreshingToken = true;

          try {
            const data = await config.onTokenRefresh(accessToken, refreshToken);

            // Update token
            if (config.onTokenUpdate) {
              config.onTokenUpdate(data.accessToken, data.refreshToken);
            }

            // Process pending requests
            isRefreshingToken = false;
            resolvePending(data.accessToken);

            // 원래 요청 재시도
            request.headers!.Authorization = `Bearer ${data.accessToken}`;
            return client(request);
          } catch (refreshError) {
            isRefreshingToken = false;

            // Logout
            if (config.onLogout) {
              config.onLogout();
            }

            return Promise.reject(refreshError);
          }
        }
      }

      // 403 Forbidden - Authentication error -> Logout
      if (status === 403 && config.onLogout && config.isAuthError) {
        const errorCode = (error.response?.data as { code?: string })?.code;
        if (errorCode && config.isAuthError(errorCode)) {
          config.onLogout();
        }
      }

      return Promise.reject(error);
    },
  );

  return client;
}

export const basicApiClient = axios.create({
  baseURL: getApiUrl(),
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});
