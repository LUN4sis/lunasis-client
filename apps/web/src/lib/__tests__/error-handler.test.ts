import { AxiosError } from 'axios';

import {
  ApiErrorResponse,
  AppError,
  AuthError,
  ERROR_MESSAGES,
  ErrorCode,
  NetworkError,
  PermissionError,
  ServerError,
  ValidationError,
} from '@repo/shared/types';
import {
  getErrorMessage,
  handleAndLogError,
  handleApiError,
  handleError,
  isAuthenticationError,
  isRetryableError,
  transformAxiosError,
  transformError,
} from '@repo/shared/utils';

// ─── Mocks ────────────────────────────────────────────────────────────────────

// isDevelopment controls detail logging in handleAndLogError.
// Return false (production mode) so we exercise the non-verbose branch by default.
jest.mock('@repo/shared/constants/config', () => ({
  isDevelopment: jest.fn().mockReturnValue(false),
  isProduction: jest.fn().mockReturnValue(true),
}));

// Suppress console output produced by the logger during tests.
// error-handler.ts imports logger from './logger' — a sibling relative import —
// which Jest resolves independently of the @repo/shared/utils barrel.
// Mocking the console methods is the most reliable approach here.
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => undefined);
  jest.spyOn(console, 'info').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'debug').mockImplementation(() => undefined);
});

afterAll(() => {
  jest.restoreAllMocks();
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeAxiosError(
  status: number,
  data?: Record<string, unknown>,
  message?: string,
  code?: string,
): AxiosError<ApiErrorResponse> {
  const error = new AxiosError(
    message ?? 'Request failed',
    code,
    undefined,
    {},
    {
      status,
      data: (data ?? {}) as unknown as ApiErrorResponse,
      headers: {},
      config: { headers: {} } as never,
      statusText: 'Error',
    },
  );
  return error as AxiosError<ApiErrorResponse>;
}

function makeNetworkAxiosError(message = 'Network Error'): AxiosError<ApiErrorResponse> {
  const error = new AxiosError(message);
  // no response — simulates network failure
  return error as AxiosError<ApiErrorResponse>;
}

function makeTimeoutAxiosError(): AxiosError<ApiErrorResponse> {
  const error = new AxiosError('timeout of 30000ms exceeded', 'ECONNABORTED');
  return error as AxiosError<ApiErrorResponse>;
}

// ─── transformAxiosError ─────────────────────────────────────────────────────

describe('transformAxiosError', () => {
  describe('timeout errors', () => {
    it('returns AppError with TIMEOUT code for ECONNABORTED code', () => {
      const error = makeTimeoutAxiosError();
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.code).toBe(ErrorCode.TIMEOUT);
      expect(result.statusCode).toBe(408);
    });

    it('returns AppError with TIMEOUT code when message contains "timeout"', () => {
      const error = new AxiosError('request timeout occurred') as AxiosError<ApiErrorResponse>;
      const result = transformAxiosError(error);

      expect(result.code).toBe(ErrorCode.TIMEOUT);
    });
  });

  describe('network errors (no response)', () => {
    it('returns NetworkError when there is no response', () => {
      const error = makeNetworkAxiosError('Connection refused');
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.code).toBe(ErrorCode.NETWORK_ERROR);
    });

    it('uses default NETWORK_ERROR message when axios error message is empty', () => {
      const error = new AxiosError('') as AxiosError<ApiErrorResponse>;
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(NetworkError);
      expect(result.message).toBe(ERROR_MESSAGES[ErrorCode.NETWORK_ERROR].message);
    });
  });

  describe('401 Unauthorized', () => {
    it('returns AuthError for 401 response', () => {
      const error = makeAxiosError(401, { message: '권한이 없습니다.' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(AuthError);
      expect(result.statusCode).toBe(401);
    });

    it('uses server message when provided', () => {
      const error = makeAxiosError(401, { message: '토큰이 만료되었습니다' });
      const result = transformAxiosError(error);

      expect(result.message).toBe('토큰이 만료되었습니다');
    });

    it('uses HTTP_ERROR_MESSAGES fallback when no server message', () => {
      const error = makeAxiosError(401, {});
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(AuthError);
    });
  });

  describe('403 Forbidden', () => {
    it('returns PermissionError for 403 response', () => {
      const error = makeAxiosError(403, { message: '접근 금지' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(PermissionError);
      expect(result.code).toBe(ErrorCode.FORBIDDEN);
    });
  });

  describe('400 Bad Request', () => {
    it('returns ValidationError for 400 response', () => {
      const error = makeAxiosError(400, { message: 'Invalid body' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
      expect(result.code).toBe(ErrorCode.VALIDATION_ERROR);
    });

    it('passes details to ValidationError', () => {
      const details = { email: ['Invalid format'] };
      const error = makeAxiosError(400, { message: 'Validation failed', details });
      const result = transformAxiosError(error) as ValidationError;

      expect(result).toBeInstanceOf(ValidationError);
    });
  });

  describe('422 Unprocessable Entity', () => {
    it('returns ValidationError for 422 response', () => {
      const error = makeAxiosError(422, { message: '입력하신 정보가 올바르지 않아요.' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });
  });

  describe('404 Not Found', () => {
    it('returns AppError with NOT_FOUND code for generic 404', () => {
      const error = makeAxiosError(404, {});
      const result = transformAxiosError(error);

      expect(result.code).toBe(ErrorCode.NOT_FOUND);
      expect(result.statusCode).toBe(404);
    });

    it('returns ValidationError for BAD_REQUEST message with 404', () => {
      const error = makeAxiosError(404, { message: '잘못된 요청입니다.' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('returns ValidationError for INVALID_UUID message with 404', () => {
      const error = makeAxiosError(404, { message: '잘못 된 UUID 입니다.' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('returns AppError for USER_NOT_FOUND message with 404', () => {
      const error = makeAxiosError(404, { message: '유저 정보를 찾을 수 없습니다.' });
      const result = transformAxiosError(error);

      expect(result.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('returns ValidationError for message containing "잘못"', () => {
      const error = makeAxiosError(404, { message: '잘못된 파라미터' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('returns ValidationError for message containing "유효하지"', () => {
      const error = makeAxiosError(404, { message: '유효하지 않은 값' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('returns ValidationError for message containing "형식"', () => {
      const error = makeAxiosError(404, { message: '잘못된 형식' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });

    it('returns ValidationError when data.details exists for 404', () => {
      const error = makeAxiosError(404, { details: { field: ['error'] } });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ValidationError);
    });
  });

  describe('5xx Server Errors', () => {
    it.each([500, 502, 503, 504])('returns ServerError for %d status', (status) => {
      const error = makeAxiosError(status, { message: '서버 오류' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(ServerError);
      expect(result.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
    });
  });

  describe('default case', () => {
    it('returns AppError for unhandled status codes', () => {
      const error = makeAxiosError(429, { message: '잠시 후 다시 시도해 주세요.' });
      const result = transformAxiosError(error);

      expect(result).toBeInstanceOf(AppError);
      expect(result.statusCode).toBe(429);
    });

    it('falls back to UNKNOWN_ERROR code when data has no code', () => {
      const error = makeAxiosError(418, {});
      const result = transformAxiosError(error);

      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    });

    it('uses UNKNOWN_ERROR message when no server message and status not mapped', () => {
      const error = makeAxiosError(418, {});
      const result = transformAxiosError(error);

      expect(result.message).toBe(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message);
    });
  });
});

// ─── transformError ───────────────────────────────────────────────────────────

describe('transformError', () => {
  it('returns the same AppError instance when passed an AppError', () => {
    const appError = new AppError(ErrorCode.NOT_FOUND, 'not found');
    const result = transformError(appError);

    expect(result).toBe(appError);
  });

  it('returns the same AppError subclass instance when passed a subclass', () => {
    const networkError = new NetworkError('down');
    const result = transformError(networkError);

    expect(result).toBe(networkError);
  });

  it('handles Axios errors by delegating to transformAxiosError', () => {
    const axiosError = makeAxiosError(401, { message: '권한 없음' });
    const result = transformError(axiosError);

    expect(result).toBeInstanceOf(AuthError);
  });

  it('wraps standard Error in AppError with UNKNOWN_ERROR code', () => {
    const error = new Error('generic error');
    const result = transformError(error);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.message).toBe('generic error');
    expect(result.originalError).toBe(error);
  });

  it('wraps string in AppError with UNKNOWN_ERROR code and default message', () => {
    const result = transformError('plain string error');

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.message).toBe(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message);
  });

  it('wraps null in AppError with UNKNOWN_ERROR code', () => {
    const result = transformError(null);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('wraps undefined in AppError with UNKNOWN_ERROR code', () => {
    const result = transformError(undefined);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('wraps numeric errors in AppError', () => {
    const result = transformError(42);

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('wraps plain objects in AppError', () => {
    const result = transformError({ custom: true });

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

// ─── handleError ─────────────────────────────────────────────────────────────

describe('handleError', () => {
  it('returns an AppError for any input', () => {
    const result = handleError(new Error('test'));

    expect(result).toBeInstanceOf(AppError);
  });

  it('passes through AppError unchanged', () => {
    const appError = new AppError(ErrorCode.FORBIDDEN, 'forbidden');
    const result = handleError(appError);

    expect(result).toBe(appError);
  });

  it('accepts an optional context string without throwing', () => {
    expect(() => handleError(new Error('test'), 'auth module')).not.toThrow();
  });

  it('works without a context argument', () => {
    expect(() => handleError(new Error('test'))).not.toThrow();
  });

  it('wraps unknown errors', () => {
    const result = handleError('not an Error object');

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });
});

// ─── handleAndLogError ────────────────────────────────────────────────────────

describe('handleAndLogError', () => {
  it('returns an AppError for any input', () => {
    const result = handleAndLogError(new Error('test'));

    expect(result).toBeInstanceOf(AppError);
  });

  it('handles auth errors silently (no detailed log)', () => {
    const authError = new AuthError('token expired', ErrorCode.TOKEN_EXPIRED);
    const result = handleAndLogError(authError, 'login flow');

    expect(result).toBe(authError);
  });

  it('handles AUTH_REQUIRED code as auth error', () => {
    const error = new AppError(ErrorCode.AUTH_REQUIRED);
    const result = handleAndLogError(error);

    expect(result).toBe(error);
  });

  it('handles non-auth errors', () => {
    const error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR);
    const result = handleAndLogError(error, 'api call');

    expect(result).toBe(error);
  });

  it('wraps standard Error and returns AppError', () => {
    const result = handleAndLogError(new Error('crash'));

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('accepts optional context string', () => {
    expect(() => handleAndLogError(new Error('test'), 'my context')).not.toThrow();
  });
});

// ─── getErrorMessage ──────────────────────────────────────────────────────────

describe('getErrorMessage', () => {
  it('returns message from AppError', () => {
    const error = new AppError(ErrorCode.NOT_FOUND, 'Page not found');

    expect(getErrorMessage(error)).toBe('Page not found');
  });

  it('returns message from standard Error', () => {
    expect(getErrorMessage(new Error('crash'))).toBe('crash');
  });

  it('returns UNKNOWN_ERROR default message for non-Error values', () => {
    expect(getErrorMessage('string')).toBe(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message);
    expect(getErrorMessage(null)).toBe(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message);
    expect(getErrorMessage(undefined)).toBe(ERROR_MESSAGES[ErrorCode.UNKNOWN_ERROR].message);
  });

  it('extracts message from axios error', () => {
    const axiosError = makeAxiosError(500, { message: '서버 오류' });

    expect(getErrorMessage(axiosError)).toBeTruthy();
  });
});

// ─── isRetryableError ─────────────────────────────────────────────────────────

describe('isRetryableError', () => {
  it('returns true for NetworkError', () => {
    expect(isRetryableError(new NetworkError())).toBe(true);
  });

  it('returns true for ServerError', () => {
    expect(isRetryableError(new ServerError())).toBe(true);
  });

  it('returns true for AppError with statusCode 408', () => {
    const error = new AppError(ErrorCode.TIMEOUT, 'timeout', 408);

    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for AppError with statusCode 429', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR, 'rate limited', 429);

    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for AppError with statusCode 502', () => {
    const error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'bad gateway', 502);

    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for AppError with statusCode 503', () => {
    const error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'service unavailable', 503);

    expect(isRetryableError(error)).toBe(true);
  });

  it('returns true for AppError with statusCode 504', () => {
    const error = new AppError(ErrorCode.INTERNAL_SERVER_ERROR, 'gateway timeout', 504);

    expect(isRetryableError(error)).toBe(true);
  });

  it('returns false for AuthError (not retryable)', () => {
    expect(isRetryableError(new AuthError())).toBe(false);
  });

  it('returns false for ValidationError', () => {
    expect(isRetryableError(new ValidationError())).toBe(false);
  });

  it('returns false for AppError with non-retryable statusCode', () => {
    const error = new AppError(ErrorCode.VALIDATION_ERROR, 'invalid', 400);

    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for AppError with no statusCode', () => {
    const error = new AppError(ErrorCode.UNKNOWN_ERROR);

    expect(isRetryableError(error)).toBe(false);
  });

  it('returns false for standard Error', () => {
    expect(isRetryableError(new Error('generic'))).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isRetryableError(null)).toBe(false);
    expect(isRetryableError(undefined)).toBe(false);
  });
});

// ─── isAuthenticationError ────────────────────────────────────────────────────

describe('isAuthenticationError', () => {
  it('returns true for AuthError instances', () => {
    expect(isAuthenticationError(new AuthError())).toBe(true);
  });

  it('returns true for AppError with AUTH_REQUIRED code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.AUTH_REQUIRED))).toBe(true);
  });

  it('returns true for AppError with UNAUTHORIZED code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.UNAUTHORIZED))).toBe(true);
  });

  it('returns true for AppError with TOKEN_EXPIRED code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.TOKEN_EXPIRED))).toBe(true);
  });

  it('returns true for AppError with TOKEN_INVALID code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.TOKEN_INVALID))).toBe(true);
  });

  it('returns true for AppError with REFRESH_TOKEN_EXPIRED code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.REFRESH_TOKEN_EXPIRED))).toBe(true);
  });

  it('returns true for AppError with TOKEN_NOT_PAIR code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.TOKEN_NOT_PAIR))).toBe(true);
  });

  it('returns true for AppError with TOKEN_NOT_EXIST code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.TOKEN_NOT_EXIST))).toBe(true);
  });

  it('returns true for AppError with INVALID_CODE code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.INVALID_CODE))).toBe(true);
  });

  it('returns true for AppError with EXCHANGE_FAILED code', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.EXCHANGE_FAILED))).toBe(true);
  });

  it('returns false for non-auth AppError codes', () => {
    expect(isAuthenticationError(new AppError(ErrorCode.NOT_FOUND))).toBe(false);
    expect(isAuthenticationError(new AppError(ErrorCode.INTERNAL_SERVER_ERROR))).toBe(false);
    expect(isAuthenticationError(new AppError(ErrorCode.VALIDATION_ERROR))).toBe(false);
    expect(isAuthenticationError(new AppError(ErrorCode.NETWORK_ERROR))).toBe(false);
  });

  it('returns false for NetworkError', () => {
    expect(isAuthenticationError(new NetworkError())).toBe(false);
  });

  it('returns false for ServerError', () => {
    expect(isAuthenticationError(new ServerError())).toBe(false);
  });

  it('returns false for standard Error', () => {
    expect(isAuthenticationError(new Error('generic'))).toBe(false);
  });

  it('returns false for null and undefined', () => {
    expect(isAuthenticationError(null)).toBe(false);
    expect(isAuthenticationError(undefined)).toBe(false);
  });
});

// ─── handleApiError (legacy) ─────────────────────────────────────────────────

describe('handleApiError (legacy alias)', () => {
  it('delegates to transformError and returns AppError', () => {
    const result = handleApiError(new Error('test'));

    expect(result).toBeInstanceOf(AppError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
  });

  it('passes through AppError unchanged', () => {
    const appError = new AppError(ErrorCode.FORBIDDEN, 'forbidden');

    expect(handleApiError(appError)).toBe(appError);
  });
});
