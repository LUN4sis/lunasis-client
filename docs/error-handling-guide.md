# LUNAsis 에러 핸들링 가이드

> **Version**: 2.0.0  
> **Last Updated**: 2024-12-02  
> **Author**: LUNAsis Development Team

## 목차

1. [개요](#개요)
2. [설계 원칙](#설계-원칙)
3. [아키텍처](#아키텍처)
4. [Shared Package](#shared-package)
5. [플랫폼별 구현](#플랫폼별-구현)
6. [컴포넌트 에러 처리](#컴포넌트-에러-처리)
7. [에러 코드 매트릭스](#에러-코드-매트릭스)
8. [Best Practices](#best-practices)

---

## 개요

Next.js PWA(Web)와 React Native Expo(Mobile)로 구성된 모노레포 프로젝트의 에러 처리 표준 가이드.

### 목표

- **플랫폼 독립성**: Web과 Mobile에서 동일한 에러 처리 로직 사용
- **사용자 친화성**: 기술적 에러를 이해 가능한 메시지로 변환
- **자동 복구**: 재시도 가능한 에러는 자동 재시도
- **추적 가능성**: 모든 에러 로깅
- **계층적 처리**: API → Hook → Component → Boundary 순서로 전파

---

## 설계 원칙

### 계층적 에러 처리

```
API Layer (BaseApi)
  ↓ 에러 변환 및 토큰 갱신
Business Logic Layer (React Query)
  ↓ 자동 재시도 및 상태 관리
Component Layer
  ↓ UI 에러 표시 및 사용자 액션
Error Boundary
  ↓ 런타임 에러 catch
Global Error Handler
  ↓ 최종 안전망
```

### 플랫폼 독립성

- `packages/shared`에 모든 에러 타입과 처리 로직 정의
- Web과 Mobile 모두 `BaseApi` 클래스 사용
- 에러 메시지, 코드, 변환 로직 공유

### 표준 에러 구조

모든 에러는 `AppError` 클래스로 표준화:

```typescript
{
  code: ErrorCode,          // 에러 코드 enum
  message: string,          // 사용자 친화적 메시지
  statusCode?: number,      // HTTP 상태 코드
  originalError?: unknown,  // 원본 에러 (디버깅)
  details?: Record          // 추가 정보 (validation errors 등)
}
```

---

## 아키텍처

### 전체 흐름

```
User Action
    ↓
Component (React Query hook)
    ↓
React Query (retry logic)
    ↓
BaseApi (axios interceptor)
    ├─ 401 → 토큰 갱신
    ├─ 요청 큐잉
    └─ transformAxiosError
         ↓
Error Handler Utils
    ├─ transformError
    ├─ AppError 생성
    └─ Logger
```

---

## Shared Package

### 구조

```
packages/shared/src/
├── types/error.type.ts          # 에러 타입, 코드, 메시지
├── utils/error-handler.ts       # 에러 변환 및 처리
├── utils/logger.ts              # 로깅
└── api/base.api.ts              # BaseApi 클래스
```

### 에러 타입 정의

**`packages/shared/src/types/error.type.ts`**

#### ErrorCode

```typescript
export enum ErrorCode {
  // Authentication
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'INVALID_TOKEN',
  REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
  TOKEN_NOT_PAIR = 'TOKEN_NOT_PAIR',
  TOKEN_NOT_EXIST = 'TOKEN_NOT_EXIST',

  // OAuth
  INVALID_CODE = 'INVALID_CODE',
  EXCHANGE_FAILED = 'EXCHANGE_FAILED',

  // Network
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
  NOT_FOUND = 'NOT_FOUND',

  // Server
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Client
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
```

#### 에러 메시지

```typescript
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: 'Login is required.',
  [ErrorCode.UNAUTHORIZED]: 'Access denied.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to access this page.",
  [ErrorCode.NETWORK_ERROR]: 'Check your network connection.',
  [ErrorCode.TIMEOUT]: 'Request timed out.',
  // ...
};

export const HTTP_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request.',
  401: 'Login is required.',
  403: 'Access denied.',
  404: 'Requested information not found',
  408: 'Request timed out.',
  // ...
};
```

#### AppError 클래스

```typescript
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string = ERROR_MESSAGES[code],
    public statusCode?: number,
    public originalError?: unknown,
    public details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}
```

#### 특화 에러 클래스

```typescript
export class NetworkError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]) {
    super(ErrorCode.NETWORK_ERROR, message, 0);
    this.name = 'NetworkError';
  }
}

export class AuthError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES[ErrorCode.UNAUTHORIZED],
    code: ErrorCode = ErrorCode.UNAUTHORIZED,
  ) {
    super(code, message, 401);
    this.name = 'AuthError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string = ERROR_MESSAGES[ErrorCode.VALIDATION_ERROR],
    public readonly errors?: Record<string, string[]>,
  ) {
    super(ErrorCode.VALIDATION_ERROR, message, 400, undefined, { errors });
    this.name = 'ValidationError';
  }
}

export class ServerError extends AppError {
  constructor(message: string = ERROR_MESSAGES[ErrorCode.INTERNAL_SERVER_ERROR]) {
    super(ErrorCode.INTERNAL_SERVER_ERROR, message, 500);
    this.name = 'ServerError';
  }
}
```

### 에러 핸들러

**`packages/shared/src/utils/error-handler.ts`**

#### transformAxiosError

Axios 에러를 AppError로 변환

```typescript
export function transformAxiosError(error: AxiosError<ApiErrorResponse>): AppError {
  // Timeout
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new AppError(ErrorCode.TIMEOUT, ERROR_MESSAGES[ErrorCode.TIMEOUT], 408, error);
  }

  // Network error (no response)
  if (!error.response) {
    logger.error('Network error occurred', { error });
    return new NetworkError(error.message || ERROR_MESSAGES[ErrorCode.NETWORK_ERROR]);
  }

  const { status, data } = error.response;
  const serverMessage = data?.message;
  const message =
    serverMessage || HTTP_ERROR_MESSAGES[status] || ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR];

  // HTTP status code mapping
  switch (status) {
    case 401:
      return new AuthError(message, data?.code as ErrorCode);
    case 403:
      return new PermissionError(message);
    case 400:
    case 422:
      return new ValidationError(message, data?.details as Record<string, string[]>);
    case 404:
      return handle404Error(message, status, error, data);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message);
    default:
      return new AppError(
        (data?.code as ErrorCode) || ErrorCode.UNKNOWN_ERROR,
        message,
        status,
        error,
        data?.details,
      );
  }
}
```

#### 유틸리티 함수

```typescript
// 모든 에러를 AppError로 변환
export function transformError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (axios.isAxiosError(error)) return transformAxiosError(error);
  if (error instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, error);
  }
  return new AppError(ErrorCode.UNKNOWN_ERROR, ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR]);
}

// 에러 메시지 추출
export function getErrorMessage(error: unknown): string {
  const appError = transformError(error);
  return appError.message;
}

// 재시도 가능 여부
export function isRetryableError(error: unknown): boolean {
  if (error instanceof NetworkError) return true;
  if (error instanceof ServerError) return true;
  if (error instanceof AppError) {
    return [408, 429, 502, 503, 504].includes(error.statusCode || 0);
  }
  return false;
}

// 인증 에러 확인
export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof AuthError) return true;
  if (error instanceof AppError) {
    return [
      ErrorCode.AUTH_REQUIRED,
      ErrorCode.UNAUTHORIZED,
      ErrorCode.TOKEN_EXPIRED,
      ErrorCode.TOKEN_INVALID,
      ErrorCode.REFRESH_TOKEN_EXPIRED,
      ErrorCode.TOKEN_NOT_PAIR,
      ErrorCode.TOKEN_NOT_EXIST,
      ErrorCode.INVALID_CODE,
      ErrorCode.EXCHANGE_FAILED,
    ].includes(error.code);
  }
  return false;
}

// Validation 에러 필드 추출
export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof ValidationError && error.errors) {
    return error.errors;
  }
  if (error instanceof AppError && error.details?.errors) {
    return error.details.errors as Record<string, string[]>;
  }
  return null;
}
```

### BaseApi 클래스

**`packages/shared/src/api/base.api.ts`**

토큰 관리와 에러 처리를 자동화하는 API 클라이언트

**주요 기능:**

- 자동 토큰 첨부
- 401 에러 시 토큰 갱신 후 재시도
- 토큰 갱신 중 요청 큐잉
- 에러 자동 변환

```typescript
export class BaseApi {
  private client: AxiosInstance;
  private isRefreshingToken: boolean = false;
  private pendingRequests: PendingRequest[] = [];

  constructor(config: BaseApiConfig) {
    this.client = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
    });

    this.setupRequestInterceptor();
    this.setupResponseInterceptor();
  }

  // Request interceptor: 토큰 자동 첨부
  private setupRequestInterceptor(): void {
    this.client.interceptors.request.use((requestConfig) => {
      const token = this.config.getAccessToken();
      if (token && requestConfig.headers) {
        requestConfig.headers.Authorization = `Bearer ${token}`;
      }
      return requestConfig;
    });
  }

  // Response interceptor: 에러 처리 및 토큰 갱신
  private setupResponseInterceptor(): void {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiErrorResponse>) => {
        // 401 → 토큰 갱신 시도
        if (error.response?.status === 401 && !originalRequest._retry) {
          return this.handleTokenRefresh(originalRequest, error);
        }

        return Promise.reject(transformAxiosError(error));
      },
    );
  }

  // 토큰 갱신 로직
  private async handleTokenRefresh(originalRequest, error): Promise<AxiosResponse> {
    // 이미 갱신 중이면 큐에 추가
    if (this.isRefreshingToken) {
      return this.enqueueRequest(originalRequest);
    }

    this.isRefreshingToken = true;

    try {
      const newTokens = await this.config.onTokenRefresh(accessToken, refreshToken);
      this.config.onTokenUpdate(newTokens.accessToken, newTokens.refreshToken);
      this.resolvePendingRequests(newTokens.accessToken);
      return this.retryRequest(originalRequest, newTokens.accessToken);
    } catch (refreshError) {
      this.config.onLogout();
      return Promise.reject(refreshError);
    } finally {
      this.isRefreshingToken = false;
    }
  }

  // HTTP methods
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return this.unwrapResponse<T>(response);
  }

  public async post<T, D>(url: string, data?: D, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return this.unwrapResponse<T>(response);
  }

  // ... put, patch, delete
}
```

### React Query 설정

**`apps/web/src/lib/query-client.ts` (Mobile 동일)**

```typescript
import { QueryClient } from '@tanstack/react-query';
import { isRetryableError } from '@repo/shared/utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1분
      gcTime: 5 * 60 * 1000, // 5분

      retry: (failureCount, error) => {
        if (failureCount >= 3) return false;
        return isRetryableError(error);
      },

      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
```

---

## 플랫폼별 구현

### Web (Next.js)

#### API 클라이언트

**`apps/web/src/api/api.ts`**

```typescript
import { BaseApi, getApiUrl } from '@repo/shared/api/base.api';
import { useAuthStore } from '@repo/shared/features/auth';
import { refreshTokenAPI } from '@repo/shared/features/auth/api/auth.api';
import { logoutSync } from '@web/features/auth/hooks/use-auth';

export const api = new BaseApi({
  baseURL: getApiUrl(),
  timeout: 10000,
  unwrapData: false,

  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,

  onTokenRefresh: async (accessToken, refreshToken) => {
    const response = await refreshTokenAPI(accessToken, refreshToken);
    return { accessToken: response.accessToken, refreshToken: response.refreshToken };
  },

  onTokenUpdate: (accessToken, refreshToken) => {
    useAuthStore.getState().updateTokens({ accessToken, refreshToken });
  },

  onLogout: () => logoutSync(),

  isAuthError: (errorCode) => isAuthError(errorCode as ErrorCode),
});
```

#### Global Error Handler

**`apps/web/src/app/error.tsx`**

```typescript
'use client';

import { useEffect } from 'react';
import { logger } from '@repo/shared/utils';
import { ROUTES } from '@web/lib/constants';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    logger.error('Page error occurred', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div>
      <h1>Oops!</h1>
      <h2>A temporary problem occurred.</h2>
      <p>The server is a little dizzy. Please try again later.</p>

      <button onClick={reset}>Refresh page</button>
      <button onClick={() => window.location.href = ROUTES.ROOT}>Go to home</button>
    </div>
  );
};

export default Error;
```

#### 404 Handler

**`apps/web/src/app/not-found.tsx`**

```typescript
import Link from 'next/link';
import { ROUTES } from '@web/lib/constants';

const NotFound = () => {
  return (
    <div>
      <h1>404</h1>
      <h2>Lost your way?</h2>
      <p>The page you requested has disappeared into space.</p>

      <Link href={ROUTES.ROOT}>Go to home</Link>
      <a href="javascript:history.back()">Go back</a>
    </div>
  );
};

export default NotFound;
```

#### Error Boundary

**`apps/web/src/components/error-boundary.tsx`**

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@repo/shared/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('Error boundary caught', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div>
          <h2>An error occurred</h2>
          <p>A temporary problem occurred. Please try again.</p>
          <button onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Mobile (Expo)

Mobile도 Web과 동일한 구조. `BaseApi`와 `@repo/shared` 유틸리티 사용.

#### Error Handler

**`apps/mobile/app/_error.tsx`**

```typescript
import { View, Text, Pressable } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { logger } from '@repo/shared/utils';

const ErrorScreen = ({ error, retry }: ErrorProps) => {
  const router = useRouter();

  useEffect(() => {
    logger.error('Route error', { message: error.message });
  }, [error]);

  return (
    <View>
      <Text>An error occurred</Text>
      <Text>A temporary error occurred. Please try again later.</Text>
      <Pressable onPress={retry || (() => router.replace('/'))}>
        <Text>Try again</Text>
      </Pressable>
    </View>
  );
};

export default ErrorScreen;
```

#### 404 Handler

**`apps/mobile/app/+not-found.tsx`**

```typescript
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

const NotFoundScreen = () => {
  const router = useRouter();

  return (
    <View>
      <Text>404</Text>
      <Text>페이지를 찾을 수 없습니다</Text>
      <Pressable onPress={() => router.replace('/')}>
        <Text>홈으로 이동</Text>
      </Pressable>
    </View>
  );
};

export default NotFoundScreen;
```

---

## 컴포넌트 에러 처리

### Hook 에러 처리

React Query Hook 예시

```typescript
// packages/shared/src/features/community/hooks/use-community-query.ts
export const usePostsInfiniteQuery = (category?: CommunityCategory, size = 20) => {
  return useInfiniteQuery({
    queryKey: communityKeys.postsByCategory(category),
    queryFn: ({ pageParam = 0 }) => communityApi.getPosts({ category, page: pageParam, size }),
    getNextPageParam: (lastPage) =>
      !lastPage.data?.last ? (lastPage.data?.number ?? 0) + 1 : undefined,
    initialPageParam: 0,
    // React Query 전역 retry 설정 자동 적용
  });
};
```

### Component 에러 표시

```typescript
// apps/web/src/features/community/components/post-list.tsx
'use client';

import { getErrorMessage } from '@repo/shared/utils';
import { usePosts } from '../hooks/use-posts';

export const PostList = () => {
  const { data, isLoading, isError, error, refetch } = usePosts({ page: 1, size: 20 });

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div>
        <p>{getErrorMessage(error)}</p>
        <button onClick={() => refetch()}>Try again</button>
      </div>
    );
  }

  return (
    <div>
      {data.content.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};
```

### Mutation 에러 처리

```typescript
// apps/web/src/app/(main)/community/posts/create/page.tsx
const CreatePostPage = () => {
  const { addToast } = useToastStore();

  const createPostMutation = useCreatePostMutation({
    onSuccess: (data) => {
      addToast('게시글이 작성되었습니다', 'success');
      router.push(`/community/post/${data.postId}`);
    },
    onError: (error) => {
      addToast(getErrorMessage(error), 'error');
    },
  });

  return <PostForm onSubmit={(data) => createPostMutation.mutate(data)} />;
};
```

### Validation 에러

```typescript
import { getValidationErrors, getErrorMessage } from '@repo/shared/utils';

const PostForm = ({ onSubmit }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (data) => {
    setErrors({});

    try {
      await onSubmit(data);
    } catch (error) {
      const fieldErrors = getValidationErrors(error);
      if (fieldErrors) {
        const formatted: Record<string, string> = {};
        Object.entries(fieldErrors).forEach(([field, messages]) => {
          formatted[field] = messages[0];
        });
        setErrors(formatted);
      } else {
        console.error('Post creation failed:', getErrorMessage(error));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input error={errors.title} {...titleProps} />
      <Textarea error={errors.content} {...contentProps} />
      <Button type="submit">작성하기</Button>
    </form>
  );
};
```

---

## 에러 코드 매트릭스

### HTTP 상태별 처리

| Code        | Type            | Auto Retry        | Message                            | Action             |
| ----------- | --------------- | ----------------- | ---------------------------------- | ------------------ |
| **400**     | ValidationError | ✗                 | "Bad request."                     | 필드별 에러 표시   |
| **401**     | AuthError       | ○ (1회, 토큰갱신) | "Login is required."               | 토큰 갱신 → 로그인 |
| **403**     | PermissionError | ✗                 | "Access denied."                   | -                  |
| **404**     | AppError        | ✗                 | "Requested information not found"  | not-found.tsx      |
| **408**     | AppError        | ○ (최대 3회)      | "Request timed out."               | -                  |
| **422**     | ValidationError | ✗                 | "Check your input."                | 필드별 에러 표시   |
| **429**     | AppError        | ○ (최대 3회)      | "Too many requests."               | -                  |
| **500**     | ServerError     | ○ (최대 3회)      | "Server error occurred."           | -                  |
| **502**     | ServerError     | ○ (최대 3회)      | "Server connection failed."        | -                  |
| **503**     | ServerError     | ○ (최대 3회)      | "Service temporarily unavailable." | -                  |
| **504**     | ServerError     | ○ (최대 3회)      | "Server response timed out."       | -                  |
| **Network** | NetworkError    | ○ (최대 3회)      | "Check your network connection."   | -                  |

### 재시도 전략

```typescript
// React Query 전역 설정
retry: (failureCount, error) => {
  if (failureCount >= 3) return false;
  return isRetryableError(error);
},

// 지수 백오프: 1초 → 2초 → 4초 (최대 30초)
retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
```

**재시도 대상:**

- NetworkError
- ServerError (500, 502, 503, 504)
- Timeout (408)
- Rate Limit (429)

**재시도 제외:**

- ValidationError (400, 422)
- AuthError (401, 403)
- Not Found (404)
- Conflict (409)

### 시나리오별 흐름

#### 1. 네트워크 에러 → 자동 재시도 → 복구

```
API 호출
  ↓
네트워크 실패
  ↓
transformAxiosError → NetworkError
  ↓
React Query 재시도
  - isRetryableError = true
  - 1초 후 재시도
  - 성공
```

#### 2. Validation 에러 → 필드별 표시

```
POST /community/posts { title: '', content: 'test' }
  ↓
400 Bad Request
{
  code: 'VALIDATION_ERROR',
  details: { errors: { title: ['Title is required'] } }
}
  ↓
transformAxiosError → ValidationError
  ↓
React Query - 재시도 안 함
  ↓
getValidationErrors
  ↓
title 입력란 아래 "Title is required" 표시
```

#### 3. 401 에러 → 토큰 갱신 → 재시도

```
GET /user/profile
  ↓
401 Unauthorized
  ↓
BaseApi.handleTokenRefresh
  - refreshTokenAPI() 호출
  - 새 토큰 저장
  - 원래 요청 재시도
  ↓
200 OK
```

---

## Best Practices

### 에러 메시지

**좋은 예:**

```typescript
'Check your network connection.';
'A temporary server problem occurred.';
'Check your input.';
```

**나쁜 예:**

```typescript
'ERR_CONNECTION_REFUSED';
'500 Internal Server Error';
'Error occurred';
```

### 로깅

**Development:**

```typescript
logger.debug('API request', { url, params });
logger.error('Error occurred', { code, message, stack });
```

**Production:**

```typescript
logger.error('Error occurred', { code, message });
```

**금지:**

```typescript
logger.error('Login failed', {
  password: user.password,
  accessToken: token,
});
```

### Error Boundary

**권장:**

```typescript
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>

<ErrorBoundary fallback={<CustomUI />}>
  <Component />
</ErrorBoundary>
```

**비권장:**

```typescript
// 비동기 에러는 캐치 불가
<ErrorBoundary>
  <button onClick={async () => {
    await api.get('/data'); // ✗
  }}>Click</button>
</ErrorBoundary>
```

### React Query 패턴

**권장:**

```typescript
const { data, isLoading, isError, error } = usePosts();

if (isError) {
  return <ErrorMessage message={getErrorMessage(error)} />;
}
```

**비권장:**

```typescript
// useQuery는 throw하지 않음
try {
  const { data } = usePosts(); // ✗
} catch (error) {
  // 실행 안 됨
}
```

### 핵심 규칙

1. 모든 에러는 `transformError()` 통해 AppError로 변환
2. 재시도는 React Query가 처리 (`isRetryableError` 활용)
3. 토큰 갱신은 BaseApi가 자동 처리
4. Validation 에러는 `getValidationErrors()` 사용해 필드별 표시
5. 모든 에러는 `logger.error()` 로깅
6. 사용자에게는 친화적 메시지만 표시

---

## 변경 이력

| Version | Date       | Changes               | Author       |
| ------- | ---------- | --------------------- | ------------ |
| 2.0.0   | 2025-12-02 | 실제 구현 기준 재작성 | LUNAsis Team |
| 1.0.0   | 2025-12-02 | 초안                  | LUNAsis Team |

**문서 관리**: LUNAsis Development Team
**최종 검토**: 2025-12-02
