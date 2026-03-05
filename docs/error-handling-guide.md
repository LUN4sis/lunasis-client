# LUNAsis 에러 핸들링 가이드

> **Version**: 3.0.0
> **Last Updated**: 2026-03-03
> **Author**: LUNAsis Development Team

## 목차

1. [개요](#개요)
2. [설계 원칙](#설계-원칙)
3. [아키텍처](#아키텍처)
4. [Shared Package](#shared-package)
5. [플랫폼별 구현](#플랫폼별-구현)
6. [Server Actions 에러 처리](#server-actions-에러-처리)
7. [컴포넌트 에러 처리](#컴포넌트-에러-처리)
8. [에러 코드 매트릭스](#에러-코드-매트릭스)
9. [Best Practices](#best-practices)

---

## 개요

Next.js 15 App Router PWA(Web)와 React Native Expo(Mobile)로 구성된 모노레포 프로젝트의 에러 처리 표준 가이드.

### 목표

- **플랫폼 독립성**: Web과 Mobile에서 동일한 에러 처리 로직 사용
- **사용자 친화성**: 기술적 에러를 이해 가능한 메시지로 변환
- **자동 복구**: 재시도 가능한 에러는 자동 재시도
- **추적 가능성**: 모든 에러를 `logger`로 로깅 (console.\* 직접 사용 금지)
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
error.tsx (route-level boundary)
  ↓ 라우트 런타임 에러 catch
global-error.tsx (root boundary)
  ↓ 최종 안전망 (root layout 에러 포함)
```

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
    └─ Logger (@ repo/shared/utils)
```

### Next.js 15 에러 바운더리 계층

```
app/
├── global-error.tsx          ← 최종 안전망 (root layout 에러 포함, html/body 포함)
├── error.tsx                 ← route-level 에러 (대부분의 런타임 에러)
└── [locale]/
    ├── layout.tsx            ← notFound() for invalid locales
    └── not-found.tsx         ← 404 페이지
```

**`global-error.tsx`**: Next.js 15에서 필수. root layout 에러까지 처리하며, 자체 `<html>`/`<body>` 태그를 포함해야 함.

**`error.tsx`**: route-level 에러. `reset()` 함수로 재시도 가능.

**`not-found.tsx`**: `notFound()` 호출 또는 매칭 라우트 없을 때.

---

## Shared Package

### 구조

```
packages/shared/src/
├── types/error.type.ts          # 에러 타입, 코드, 메시지
├── types/index.ts               # ApiResponse<T>, AppError 등 export
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

#### ApiResponse<T>

모든 Server Action과 API 응답의 표준 봉투:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}
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
  ) { ... }

  toJSON() { ... }
}
```

#### 특화 에러 클래스

```typescript
class NetworkError extends AppError { ... }   // Network 에러
class AuthError extends AppError { ... }      // 401 인증 에러
class ValidationError extends AppError { ... } // 400/422 유효성 에러
class ServerError extends AppError { ... }    // 500+ 서버 에러
class PermissionError extends AppError { ... } // 403 권한 에러
```

### 에러 핸들러 (`@repo/shared/utils`)

#### transformAxiosError

Axios 에러를 AppError로 변환:

```typescript
export function transformAxiosError(error: AxiosError<ApiErrorResponse>): AppError {
  if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
    return new AppError(ErrorCode.TIMEOUT, ...);
  }
  if (!error.response) {
    return new NetworkError(error.message);
  }
  switch (error.response.status) {
    case 401: return new AuthError(message, data?.code);
    case 403: return new PermissionError(message);
    case 400:
    case 422: return new ValidationError(message, data?.details);
    case 500:
    case 502:
    case 503:
    case 504: return new ServerError(message);
    default:  return new AppError(...);
  }
}
```

#### 핵심 유틸리티

```typescript
// 모든 에러를 AppError로 변환 (AppError → 그대로, AxiosError → transformAxiosError, Error → AppError, 기타 → UNKNOWN_ERROR)
export function transformError(error: unknown): AppError;

// 변환 + 로깅
export function handleError(error: unknown, context?: string): AppError;

// 메시지 추출
export function getErrorMessage(error: unknown): string;

// 재시도 가능 여부
export function isRetryableError(error: unknown): boolean;

// 인증 에러 여부
export function isAuthenticationError(error: unknown): boolean;

// validation 필드 추출
export function getValidationErrors(error: unknown): Record<string, string[]> | null;
```

### Logger (`@repo/shared/utils`)

```typescript
import { logger } from '@repo/shared/utils';

logger.debug('message', { data }); // 개발 환경에서만 출력
logger.info('message', { data });
logger.warn('message', { data });
logger.error('message', { data }); // 프로덕션에서도 출력
```

**규칙:**

- `console.*` 직접 사용 금지
- 민감 데이터 포함 금지 (토큰 값, 비밀번호)
- 모든 로그에 컨텍스트 데이터 포함

### React Query 설정

**`apps/web/src/lib/query-client.ts`**

```typescript
import { QueryClient } from '@tanstack/react-query';

import { isRetryableError } from '@repo/shared/utils';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
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

### Web (Next.js 15)

#### API 클라이언트

**`apps/web/src/api/api.ts`**

```typescript
import { BaseApi } from '@repo/shared/api/base.api';
import { useAuthStore } from '@repo/shared/features/auth';
import { refreshTokenAPI } from '@repo/shared/features/auth/api/auth.api';
import { logoutSync } from '@web/features/auth/hooks/use-auth';

export const api = new BaseApi({
  baseURL: getApiUrl(),
  timeout: 10000,
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
});
```

#### Global Error Handler (최종 안전망)

**`apps/web/src/app/global-error.tsx`**

```tsx
'use client';

import { useEffect } from 'react';

import { logger } from '@repo/shared/utils';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Next.js 15 전용. root layout 에러까지 처리.
 * 자체 <html>/<body> 태그 포함 필수.
 */
const GlobalError = ({ error, reset }: GlobalErrorProps) => {
  useEffect(() => {
    logger.error('Global error occurred', {
      message: error.message || '(empty message)',
      digest: error.digest,
      stack: error.stack,
    });
  }, [error]);

  return (
    <html lang="en">
      <body>
        {/* 최소한의 스타일로 에러 표시 */}
        <button onClick={reset}>Refresh page</button>
        <a href="/">Go to home</a>
      </body>
    </html>
  );
};

export default GlobalError;
```

#### Route Error Handler

**`apps/web/src/app/error.tsx`**

```tsx
'use client';

import { useEffect, useState } from 'react';

import { logger } from '@repo/shared/utils';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    logger.error('Page error occurred', {
      message: error.message || '(empty message)',
      digest: error.digest,
      stack: error.stack,
      url: typeof window !== 'undefined' ? window.location.href : 'unknown',
    });
  }, [error]);

  return (
    <div>
      <h1>Oops!</h1>
      <h2>A temporary problem occurred.</h2>
      <button onClick={reset}>Refresh page</button>
      <a href="/">Go to home page</a>
    </div>
  );
};

export default Error;
```

#### 404 Handler

**`apps/web/src/app/[locale]/not-found.tsx`**

```tsx
// Async Server Component — i18n 지원
const NotFound = async () => {
  const t = await getTranslations('notFound');
  return (
    <div>
      <h1>404</h1>
      <p>{t('description')}</p>
      <Link href="/">{t('goHome')}</Link>
    </div>
  );
};
```

**Locale 검증 (`[locale]/layout.tsx`):**

```typescript
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();  // 올바른 Next.js 패턴 — error.tsx가 아닌 not-found.tsx로 전달
  }

  setRequestLocale(locale);
  const messages = await getMessages(); // 에러 시 error.tsx로 자연스럽게 전파

  return ( ... );
}
```

#### Error Boundary (컴포넌트 레벨)

**`apps/web/src/components/error-boundary.tsx`**

```tsx
'use client';

import { Component, ReactNode } from 'react';

import { logger } from '@repo/shared/utils';

class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    logger.error('Error boundary caught', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI />;
    }
    return this.props.children;
  }
}
```

---

## Server Actions 에러 처리

### 표준 패턴

모든 Server Action은 `ApiResponse<T>`를 반환하고 `@web/lib/utils/server-action` 유틸리티를 사용:

```typescript
'use server';

import { ErrorCode, type ApiResponse } from '@repo/shared/types';
import { handleError, logger } from '@repo/shared/utils';
import {
  createErrorResponse,
  createErrorResponseFromUnknown,
  createSuccessResponse,
} from '@web/lib/utils/server-action';

export async function myAction(input: string): Promise<ApiResponse<MyData>> {
  logger.debug('[Server Action] myAction called', { input });

  try {
    const data = await someAPI(input);

    if (!data) {
      logger.warn('[Server Action] No data returned');
      return createErrorResponse(ErrorCode.NOT_FOUND, 'No data found');
    }

    logger.debug('[Server Action] myAction successful');
    return createSuccessResponse(data);
  } catch (error) {
    handleError(error, 'myAction'); // 로깅
    return createErrorResponseFromUnknown(error); // 응답 변환
  }
}
```

### 유틸리티 (`@web/lib/utils/server-action`)

```typescript
// 성공 응답
createSuccessResponse<T>(data: T): ApiResponse<T>

// 구조적 에러 응답
createErrorResponse<T>(code: ErrorCode, message: string): ApiResponse<T>

// AppError에서 에러 응답
createErrorResponseFromAppError<T>(error: AppError): ApiResponse<T>

// unknown 에러에서 에러 응답 (catch 블록용)
createErrorResponseFromUnknown<T>(error: unknown): ApiResponse<T>
```

### 실제 구현 예시 (`auth.actions.ts`)

```typescript
'use server';

import { ErrorCode, type ApiResponse } from '@repo/shared/types';
import { handleError, logger } from '@repo/shared/utils';
import {
  createErrorResponse,
  createErrorResponseFromUnknown,
  createSuccessResponse,
} from '@web/lib/utils/server-action';

export async function exchangeAuthToken(
  credential: string,
  provider: 'google' | 'apple',
  name?: string,
): Promise<ApiResponse<AuthSessionResponse>> {
  logger.debug('[Server Action] exchangeAuthToken called', { provider, hasName: !!name });

  try {
    const data =
      provider === 'apple'
        ? await appleLoginAPI(credential, name ?? '')
        : await googleLoginAPI(credential);

    if (data && 'success' in data && data.success === false) {
      logger.warn('[Server Action] Server returned error response', data);
      return createErrorResponse(ErrorCode.EXCHANGE_FAILED, 'Token exchange failed');
    }

    if (!data?.accessToken || !data?.refreshToken) {
      logger.warn('[Server Action] Missing required tokens in response');
      return createErrorResponse(ErrorCode.EXCHANGE_FAILED, 'Invalid response from server');
    }

    logger.debug('[Server Action] Token exchange successful');
    return createSuccessResponse(data);
  } catch (error) {
    handleError(error, 'exchangeAuthToken');
    return createErrorResponseFromUnknown(error);
  }
}
```

### 클라이언트에서 Server Action 결과 처리

```typescript
// React Query mutation에서
const loginMutation = useMutation({
  mutationFn: async (params: LoginParams) => {
    const result = await exchangeAuthToken(params.code, params.provider);

    if (!result.success) {
      const errorCode = (result.error?.code as ErrorCode) || ErrorCode.EXCHANGE_FAILED;
      throw new AppError(errorCode, result.error?.message);
    }

    return result.data;
  },
  onError: (error: unknown) => {
    const appError = transformError(error);
    logger.error('[Auth] Login failed', { code: appError.code });
  },
});
```

### Mobile (Expo)

Mobile도 Web과 동일한 구조. `BaseApi`와 `@repo/shared` 유틸리티 사용.

---

## 컴포넌트 에러 처리

### Hook 에러 처리 (React Query)

```typescript
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
'use client';

import { getErrorMessage } from '@repo/shared/utils';

export const PostList = () => {
  const { data, isLoading, isError, error, refetch } = usePosts();

  if (isLoading) return <Skeleton />;

  if (isError) {
    return (
      <div>
        <p>{getErrorMessage(error)}</p>
        <button onClick={() => refetch()}>Try again</button>
      </div>
    );
  }

  return <div>{data.content.map((post) => <PostCard key={post.id} post={post} />)}</div>;
};
```

### Mutation 에러 처리

```typescript
const createPostMutation = useCreatePostMutation({
  onSuccess: (data) => {
    addToast('게시글이 작성되었습니다', 'success');
    router.push(`/community/post/${data.postId}`);
  },
  onError: (error) => {
    addToast(getErrorMessage(error), 'error');
  },
});
```

### Validation 에러

```typescript
import { getErrorMessage, getValidationErrors } from '@repo/shared/utils';

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
      logger.error('Form submission failed', { message: getErrorMessage(error) });
    }
  }
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

**재시도 대상:** NetworkError, ServerError (500–504), Timeout (408), Rate Limit (429)

**재시도 제외:** ValidationError (400, 422), AuthError (401, 403), Not Found (404)

---

## Best Practices

### 로깅

```typescript
// 개발 전용 (프로덕션 생략)
logger.debug('API request', { url, params });

// 일반 정보
logger.info('[Auth] Token exchange successful');

// 예상 가능한 문제
logger.warn('[Server Action] Missing required tokens');

// 에러 (항상 출력)
logger.error('Operation failed', { context, code, message });
```

**절대 금지:**

```typescript
// ❌ console.* 직접 사용
console.log('debug info');
console.error('error', error);
console.warn('warning');

// ❌ 민감 데이터 로깅
logger.error('Login failed', { password, accessToken: token });
```

### Server Action 규칙

```typescript
// ✅ 올바른 패턴
export async function myAction(input: string): Promise<ApiResponse<MyData>> {
  try {
    const data = await someAPI(input);
    return createSuccessResponse(data);
  } catch (error) {
    handleError(error, 'myAction'); // 로깅 + 변환
    return createErrorResponseFromUnknown(error);
  }
}

// ❌ 잘못된 패턴
export async function myAction(input: string): Promise<{ success: boolean; error?: string }> {
  try {
    return { success: true, data: await someAPI(input) };
  } catch (error) {
    console.error('myAction failed:', error); // console 직접 사용 금지
    return { success: false, error: error.message }; // 로컬 타입 금지
  }
}
```

### Error Boundary 사용

```tsx
// ✅ 권장
<ErrorBoundary>
  <Suspense fallback={<Loading />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>

<ErrorBoundary fallback={<CustomUI />}>
  <RiskyComponent />
</ErrorBoundary>

// ❌ 비권장 — 비동기 에러는 캐치 불가
<ErrorBoundary>
  <button onClick={async () => {
    await api.get('/data'); // catch 안 됨
  }}>Click</button>
</ErrorBoundary>
```

### React Query 패턴

```typescript
// ✅ 올바른 패턴
const { data, isLoading, isError, error } = usePosts();
if (isError) {
  return <ErrorMessage message={getErrorMessage(error)} />;
}

// ❌ 잘못된 패턴 — useQuery는 throw하지 않음
try {
  const { data } = usePosts();
} catch (error) { ... } // 실행 안 됨
```

### 핵심 규칙 요약

1. 모든 에러는 `transformError()` 또는 `handleError()`로 `AppError` 변환
2. 재시도는 React Query가 처리 (`isRetryableError` 활용)
3. 토큰 갱신은 `BaseApi`가 자동 처리
4. Validation 에러는 `getValidationErrors()`로 필드별 표시
5. 모든 로깅은 `logger.*` 사용 — `console.*` 직접 사용 금지
6. Server Action은 `ApiResponse<T>` 반환 + 공유 유틸리티 사용
7. Next.js 15 에러 경계: `global-error.tsx` → `error.tsx` → `ErrorBoundary`
8. 사용자에게는 친화적 메시지만 표시 (기술 정보 노출 금지)

---

## 변경 이력

| Version | Date       | Changes                                                                                                          | Author       |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------- | ------------ |
| 3.0.0   | 2026-03-03 | Next.js 15 global-error.tsx 추가; Server Action 패턴 문서화; console.\* 금지 정책 명시; 실제 구현 기준 전면 개정 | LUNAsis Team |
| 2.0.0   | 2024-12-02 | 실제 구현 기준 재작성                                                                                            | LUNAsis Team |
| 1.0.0   | 2024-12-02 | 초안                                                                                                             | LUNAsis Team |

**문서 관리**: LUNAsis Development Team
**최종 검토**: 2026-03-03
