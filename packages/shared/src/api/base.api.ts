import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';

import { API_CONFIG } from '@repo/shared/constants/config';
import type { ApiResponse } from '@repo/shared/types/api.type';
import type { ApiErrorResponse } from '@repo/shared/types/error.type';
import { transformAxiosError } from '@repo/shared/utils';

// ===========================
// Types & Interfaces
// ===========================

/** Extended Axios request config with custom flags */
export interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  /** Skip authentication header for anonymous requests */
  skipAuth?: boolean;
}
export interface BaseApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  getAccessToken?: () => string | null;
  getRefreshToken?: () => string | null;
  onTokenRefresh?: (
    accessToken: string,
    refreshToken: string,
  ) => Promise<{ accessToken: string; refreshToken?: string }>;
  onTokenUpdate?: (accessToken: string, refreshToken?: string) => void;
  onLogout?: () => void;
  isAuthError?: (errorCode: string, status?: number) => boolean;

  singleton?: boolean;
  /** true: response.data.data
   *  false: response.data
   *  @default false
   **/
  unwrapData?: boolean;
}

/** Pending request type */
type PendingRequest = (token: string) => void;

// ===========================
// Base API Class
// ===========================
/**
 * Base API Client
 * Features:
 * - Token refresh with request queueing
 * - Automatic retry on token expiration
 * - Encapsulated token refresh logic
 * - Singleton pattern support
 *
 * @example
 * ``` typescript
 * const api = new BaseApi({
 *   baseURL: '/api',
 *   getAccessToken: () => authStore.accessToken,
 *   getRefreshToken: () => authStore.refreshToken,
 *   onTokenRefresh: async (access, refresh) => {
 *     const response = await refreshAPI(access, refresh);
 *     return response;
 *   },
 *   onTokenUpdate: (access, refresh) => {
 *     authStore.setTokens(access, refresh);
 *   },
 *   onLogout: () => authStore.logout(),
 * });
 * ```
 */
export class BaseApi {
  private static instance: BaseApi | null = null;
  private readonly client!: AxiosInstance;
  private readonly config!: Required<Omit<BaseApiConfig, 'singleton'>>;

  // Token refresh state
  private isRefreshingToken: boolean = false;
  private pendingRequests: PendingRequest[] = [];

  /**
   * Constructor
   * @param config - API client configuration
   */
  constructor(config: BaseApiConfig) {
    // handle singleton pattern
    if (config.singleton && BaseApi.instance) {
      return BaseApi.instance;
    }

    // set default values
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout ?? API_CONFIG.timeout,
      headers: config.headers ?? {},
      getAccessToken: config.getAccessToken ?? (() => null),
      getRefreshToken: config.getRefreshToken ?? (() => null),
      onTokenRefresh: config.onTokenRefresh ?? (async () => ({ accessToken: '' })),
      onTokenUpdate: config.onTokenUpdate ?? (() => {}),
      onLogout: config.onLogout ?? (() => {}),
      isAuthError: config.isAuthError ?? (() => false),
      unwrapData: config.unwrapData ?? false,
    };

    // create axios instance
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...this.config.headers,
      },
    });

    // setup interceptors
    this.setupRequestInterceptor();
    this.setupResponseInterceptor();

    // store singleton instance
    if (config.singleton) {
      BaseApi.instance = this;
    }
  }

  // ===========================
  // Public Methods
  // ===========================

  /**
   * GET request
   */
  public async get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return this.unwrapResponse<T>(response as AxiosResponse<ApiResponse<T>>);
  }

  /**
   * POST request
   */
  public async post<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return this.unwrapResponse<T>(response as AxiosResponse<ApiResponse<T>>);
  }

  /**
   * PUT request
   */
  public async put<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return this.unwrapResponse<T>(response as AxiosResponse<ApiResponse<T>>);
  }

  /**
   * PATCH request
   */
  public async patch<T = unknown, D = unknown>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return this.unwrapResponse<T>(response as AxiosResponse<ApiResponse<T>>);
  }

  /**
   * DELETE request
   */
  public async delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return this.unwrapResponse<T>(response as AxiosResponse<ApiResponse<T>>);
  }

  /**
   * Direct access to Axios instance (if needed)
   */
  public getClient(): AxiosInstance {
    return this.client;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): BaseApi | null {
    return BaseApi.instance;
  }

  /**
   * Reset singleton instance
   */
  public static resetInstance(): void {
    BaseApi.instance = null;
  }

  // ===========================
  // Private Methods - Response Handling
  // ===========================

  /**
   * unwrap response data
   */
  private unwrapResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    if (!this.config.unwrapData) {
      // return full response
      return response.data as unknown as T;
    }

    const apiResponse = response.data;

    // success: false => throw error
    if (apiResponse.success === false) {
      throw new Error(apiResponse.message || apiResponse.error?.message || '[API] Request failed');
    }

    // return data field if exists, otherwise return full response
    if ('data' in apiResponse && apiResponse.data !== undefined) {
      return apiResponse.data as T;
    }

    // no data field => return full response
    return apiResponse as unknown as T;
  }

  // ===========================
  // Private Methods - Interceptors
  // ===========================
  /**
   * Setup request interceptor
   */
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use(
      (requestConfig: InternalAxiosRequestConfig) => {
        // Skip auth header if explicitly requested (for anonymous requests)
        const skipAuth = (requestConfig as InternalAxiosRequestConfig & { skipAuth?: boolean })
          .skipAuth;
        if (skipAuth) {
          return requestConfig;
        }

        const token = this.config.getAccessToken();

        if (token && requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        return requestConfig;
      },
      (error: AxiosError) => Promise.reject(error),
    );
  }

  /**
   * Setup response interceptor
   */
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

        // return error if request config is missing
        if (!originalRequest) {
          return Promise.reject(transformAxiosError(error));
        }

        const status = error.response?.status;
        const errorData = error.response?.data as { code?: string; message?: string } | undefined;

        // 401 Unauthorized - try token refresh
        if (status === 401 && !originalRequest._retry) {
          return this.handleTokenRefresh(originalRequest, error);
        }

        // 403 Forbidden - handle auth error
        if (status === 403 && errorData?.code) {
          return this.handleAuthError(errorData.code, status, error);
        }

        return Promise.reject(transformAxiosError(error));
      },
    );
  }

  // ===========================
  // Private Methods - Token Refresh
  // ===========================

  /**
   * Handle token refresh
   */
  private async handleTokenRefresh(
    originalRequest: AxiosRequestConfig & { _retry?: boolean },
    error: AxiosError,
  ): Promise<AxiosResponse> {
    const accessToken = this.config.getAccessToken();
    const refreshToken = this.config.getRefreshToken();

    // return error if tokens are missing
    if (!accessToken || !refreshToken) {
      return Promise.reject(error);
    }

    // wait if already refreshing
    if (this.isRefreshingToken) {
      return this.enqueueRequest(originalRequest);
    }

    // start token refresh
    originalRequest._retry = true;
    this.isRefreshingToken = true;

    try {
      // call token refresh API
      const newTokens = await this.config.onTokenRefresh(accessToken, refreshToken);

      // update new tokens
      this.config.onTokenUpdate(newTokens.accessToken, newTokens.refreshToken);

      // process pending requests
      this.resolvePendingRequests(newTokens.accessToken);

      // retry original request
      return this.retryRequest(originalRequest, newTokens.accessToken);
    } catch (refreshError) {
      // logout on token refresh failure
      this.handleRefreshFailure();
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshingToken = false;
    }
  }

  /**
   * Enqueue request and wait
   */
  private enqueueRequest(request: AxiosRequestConfig): Promise<AxiosResponse> {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push((newToken: string) => {
        if (request.headers) {
          request.headers.Authorization = `Bearer ${newToken}`;
        }

        this.client(request).then(resolve).catch(reject);
      });
    });
  }

  /**
   * Resolve all pending requests
   */
  private resolvePendingRequests(newToken: string): void {
    this.pendingRequests.forEach((callback) => callback(newToken));
    this.pendingRequests = [];
  }

  /**
   * Retry original request
   */
  private retryRequest(request: AxiosRequestConfig, newToken: string): Promise<AxiosResponse> {
    if (request.headers) {
      request.headers.Authorization = `Bearer ${newToken}`;
    }
    return this.client(request);
  }

  /**
   * Handle token refresh failure
   */
  private handleRefreshFailure(): void {
    this.pendingRequests = [];
    this.config.onLogout();
  }

  // ===========================
  // Private Methods - Auth Error
  // ===========================

  /**
   * Handle authentication error
   */
  private handleAuthError(errorCode: string, status: number, error: AxiosError): Promise<never> {
    if (this.config.isAuthError(errorCode, status)) {
      this.config.onLogout();
    }

    return Promise.reject(error);
  }
}

// ===========================
// Utility Functions
// ===========================

/**
 * GET API URL
 */
// for oauth callback
export function getApiUrl(forceAbsolute?: boolean): string {
  // server-side
  if (forceAbsolute || typeof window === 'undefined') {
    return (
      (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL) ||
      'http://localhost:8080/api'
    );
  }

  // client-side
  return '/api';
}

/**
 * API client factory function
 *
 * @example
 * ``` typescript
 * export const api = createApiClient({
 *   baseURL: getApiUrl(),
 *   getAccessToken: () => useAuthStore.getState().accessToken,
 *   // ... other config
 * });
 * ```
 */
export function createApiClient(config: BaseApiConfig): BaseApi {
  return new BaseApi(config);
}
