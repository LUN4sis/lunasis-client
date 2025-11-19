// ===========================
// Error Codes
// ===========================

/**
 * 애플리케이션 에러 코드
 */
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

  // Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',

  // Client Error
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// ===========================
// Error Messages
// ===========================

/**
 * 에러 메시지 맵 (사용자에게 표시되는 메시지)
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ErrorCode.AUTH_REQUIRED]: 'Login is required.',
  [ErrorCode.UNAUTHORIZED]: 'Access denied.',
  [ErrorCode.FORBIDDEN]: "You don't have permission to access this page.",
  [ErrorCode.TOKEN_EXPIRED]: 'Token expired.',
  [ErrorCode.TOKEN_INVALID]: 'Invalid authentication information.',
  [ErrorCode.REFRESH_TOKEN_EXPIRED]: 'Refresh token expired.',
  [ErrorCode.TOKEN_NOT_PAIR]: 'Access token and refresh token information do not match.',
  [ErrorCode.TOKEN_NOT_EXIST]: 'Token information does not exist.',
  [ErrorCode.INVALID_CODE]: 'Invalid authentication code.',
  [ErrorCode.EXCHANGE_FAILED]: 'Token exchange failed.',
  [ErrorCode.NETWORK_ERROR]: 'Network error occurred.',
  [ErrorCode.TIMEOUT]: 'Request timed out.',
  [ErrorCode.NOT_FOUND]: 'Resource not found.',
  [ErrorCode.INTERNAL_SERVER_ERROR]: 'Server error occurred.',
  [ErrorCode.BAD_REQUEST]: 'Bad request.',
  [ErrorCode.VALIDATION_ERROR]: 'Validation failed.',
  [ErrorCode.UNKNOWN_ERROR]: 'Unknown error occurred.',
};

/**
 * 백엔드 에러 메시지 맵
 */
export const SERVER_ERROR_MESSAGES = {
  ACCESS_TOKEN_EXPIRED: '토큰이 만료되었습니다',
  TOKEN_NOT_EXIST: '토큰 정보가 헤더에 존재하지 않습니다',
  TOKEN_NOT_PAIR: '액세스 토큰과 리프레쉬 토큰의 정보가 다릅니다.',
  REFRESH_TOKEN_EXPIRED: '리프레쉬 토큰이 만료되었습니다.',
  INVALID_TOKEN: '잘못된 인증 정보 입니다.',

  USER_NOT_ALLOWED: '자신의 채팅 방에 관련된 요청만 보낼 수 있습니다',
  USER_NOT_FOUND: '유저 정보를 찾을 수 없습니다.',

  BAD_REQUEST: '잘못된 요청입니다.',
  UNAUTHORIZED: '권한이 없습니다.',
  INVALID_UUID: '잘못 된 UUID 입니다.',
  UNKNOWN_ERROR: '알 수 없는 오류가 발생했습니다.',
} as const;

// ===========================
// Error Class
// ===========================

/**
 * 애플리케이션 에러 클래스
 */
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string = ERROR_MESSAGES[code],
    public statusCode?: number,
    public originalError?: unknown,
  ) {
    super(message);
    this.name = 'AppError';

    // 에러 스택 트레이스 유지
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * 에러를 JSON 형식으로 변환
   */
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
    };
  }

  /**
   * 사용자에게 표시할 메시지 반환
   */
  toDisplayMessage(): string {
    return this.message;
  }
}

// ===========================
// Error Utility Functions
// ===========================

/**
 * 백엔드 응답 메시지를 ErrorCode로 매핑
 */
export function mapServerMessageToErrorCode(message: string): ErrorCode | null {
  switch (message) {
    case SERVER_ERROR_MESSAGES.ACCESS_TOKEN_EXPIRED:
      return ErrorCode.TOKEN_EXPIRED;
    case SERVER_ERROR_MESSAGES.TOKEN_NOT_EXIST:
      return ErrorCode.TOKEN_NOT_EXIST;
    case SERVER_ERROR_MESSAGES.TOKEN_NOT_PAIR:
      return ErrorCode.TOKEN_NOT_PAIR;
    case SERVER_ERROR_MESSAGES.REFRESH_TOKEN_EXPIRED:
      return ErrorCode.REFRESH_TOKEN_EXPIRED;
    case SERVER_ERROR_MESSAGES.INVALID_TOKEN:
      return ErrorCode.TOKEN_INVALID;
    case SERVER_ERROR_MESSAGES.USER_NOT_ALLOWED:
      return ErrorCode.FORBIDDEN;
    case SERVER_ERROR_MESSAGES.USER_NOT_FOUND:
      return ErrorCode.NOT_FOUND;
    case SERVER_ERROR_MESSAGES.BAD_REQUEST:
      return ErrorCode.BAD_REQUEST;
    case SERVER_ERROR_MESSAGES.UNAUTHORIZED:
      return ErrorCode.UNAUTHORIZED;
    case SERVER_ERROR_MESSAGES.INVALID_UUID:
      return ErrorCode.TOKEN_INVALID;
    case SERVER_ERROR_MESSAGES.UNKNOWN_ERROR:
      return ErrorCode.UNKNOWN_ERROR;
    default:
      return null;
  }
}

/**
 * HTTP 상태 코드를 ErrorCode로 매핑 (fallback)
 */
export function mapStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ErrorCode.BAD_REQUEST;
    case 401:
      return ErrorCode.UNAUTHORIZED;
    case 403:
      return ErrorCode.FORBIDDEN;
    case 404:
      return ErrorCode.NOT_FOUND;
    case 408:
      return ErrorCode.TIMEOUT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ErrorCode.INTERNAL_SERVER_ERROR;
    default:
      return ErrorCode.UNKNOWN_ERROR;
  }
}

/**
 * 백엔드 응답을 ErrorCode로 변환 (하이브리드 전략)
 * 1순위: 메시지 기반 매핑 (정확한 에러 식별)
 * 2순위: HTTP 상태 코드 기반 fallback
 */
export function parseServerError(response: { message?: string; code: number }): ErrorCode {
  // 1. 메시지 기반으로 정확한 에러 코드 찾기
  if (response.message) {
    const errorCode = mapServerMessageToErrorCode(response.message);
    if (errorCode) {
      return errorCode;
    }
  }

  // 2. HTTP 상태 코드로 fallback
  return mapStatusToErrorCode(response.code);
}

/**
 * 백엔드 응답을 AppError로 변환
 */
export function createAppErrorFromServer(response: { message?: string; code: number }): AppError {
  const errorCode = parseServerError(response);

  // 디버깅용으로 원본 메시지를 유지하고, 사용자에게는 영문 메시지를 표시
  const displayMessage = ERROR_MESSAGES[errorCode];

  return new AppError(errorCode, displayMessage, response.code, response.message);
}

/**
 * 에러가 AppError인지 확인
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * 에러를 AppError로 변환
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(ErrorCode.UNKNOWN_ERROR, error.message, undefined, error);
  }

  return new AppError(ErrorCode.UNKNOWN_ERROR, String(error), undefined, error);
}
