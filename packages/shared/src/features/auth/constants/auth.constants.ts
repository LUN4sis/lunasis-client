import { ErrorCode } from '@repo/shared/types';

export const TOKEN_EXPIRATION = {
  /** Access token expiration in milliseconds (24 hours) */
  ACCESS_TOKEN_MS: 24 * 60 * 60 * 1000,
  /** Refresh token expiration in milliseconds (720 hours / 30 days) */
  REFRESH_TOKEN_MS: 720 * 60 * 60 * 1000,
} as const;

export const AUTH_ERROR_CODES: readonly ErrorCode[] = [
  ErrorCode.TOKEN_EXPIRED,
  ErrorCode.TOKEN_INVALID,
  ErrorCode.TOKEN_NOT_PAIR,
  ErrorCode.REFRESH_TOKEN_EXPIRED,
  ErrorCode.TOKEN_NOT_EXIST,
  ErrorCode.FORBIDDEN,
] as const;

/**
 * Check if error code requires logout
 */
export function isAuthError(errorCode: ErrorCode): boolean {
  return AUTH_ERROR_CODES.includes(errorCode);
}
