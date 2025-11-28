import { TOKEN_EXPIRATION } from '../constants/auth.constants';

export enum TokenStatus {
  VALID = 'valid',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
}

export interface TokenExpirationInfo {
  status: TokenStatus;
  timeRemaining: number;
  shouldRefresh: boolean;
}

/**
 * Calculate token expiration status
 * @param issuedAt - Token issued timestamp (milliseconds)
 * @param expirationMs - Token expiration duration (milliseconds)
 * @param bufferMs - Buffer time before expiration (milliseconds)
 * @returns Token expiration information
 */
export function calculateTokenExpiration(
  issuedAt: number | null,
  expirationMs: number,
  bufferMs: number = TOKEN_EXPIRATION.REFRESH_BUFFER_MS,
): TokenExpirationInfo {
  // early return: no token exists
  if (issuedAt === null) {
    return {
      status: TokenStatus.EXPIRED,
      timeRemaining: 0,
      shouldRefresh: false,
    };
  }

  const now = Date.now();
  const elapsedTime = now - issuedAt;
  const timeRemaining = expirationMs - elapsedTime;

  // expired
  if (timeRemaining <= 0) {
    return {
      status: TokenStatus.EXPIRED,
      timeRemaining: 0,
      shouldRefresh: false,
    };
  }

  // expiring soon
  if (timeRemaining <= bufferMs) {
    return {
      status: TokenStatus.EXPIRING_SOON,
      timeRemaining,
      shouldRefresh: true,
    };
  }

  return {
    status: TokenStatus.VALID,
    timeRemaining,
    shouldRefresh: false,
  };
}

/**
 * check if access token is expired
 */
export function isAccessTokenExpired(accessTokenIssuedAt: number | null): boolean {
  const info = calculateTokenExpiration(accessTokenIssuedAt, TOKEN_EXPIRATION.ACCESS_TOKEN_MS);
  return info.status === TokenStatus.EXPIRED;
}

/**
 * check if refresh token is expired
 */
export function isRefreshTokenExpired(refreshTokenIssuedAt: number | null): boolean {
  const info = calculateTokenExpiration(refreshTokenIssuedAt, TOKEN_EXPIRATION.REFRESH_TOKEN_MS);
  return info.status === TokenStatus.EXPIRED;
}

/**
 * check if any token requires logout (refresh token expired)
 */
export function shouldAutoLogout(
  accessTokenIssuedAt: number | null,
  refreshTokenIssuedAt: number | null,
): boolean {
  // early return: no tokens exist
  if (accessTokenIssuedAt === null && refreshTokenIssuedAt === null) {
    return false;
  }

  // early return: no refresh token exists
  if (refreshTokenIssuedAt === null) {
    return false;
  }

  // early return: refresh token is expired
  return isRefreshTokenExpired(refreshTokenIssuedAt);
}

/**
 * Calculate time until next expiration check
 * Returns milliseconds until the next significant event:
 * - Access token expiration buffer
 * - Refresh token expiration
 */
export function getNextExpirationCheckDelay(
  accessTokenIssuedAt: number | null,
  refreshTokenIssuedAt: number | null,
): number {
  const DEFAULT_CHECK_INTERVAL = TOKEN_EXPIRATION.DEFAULT_CHECK_INTERVAL_MS;

  if (accessTokenIssuedAt === null && refreshTokenIssuedAt === null) {
    return DEFAULT_CHECK_INTERVAL;
  }

  const accessInfo = calculateTokenExpiration(
    accessTokenIssuedAt,
    TOKEN_EXPIRATION.ACCESS_TOKEN_MS,
  );

  const refreshInfo = calculateTokenExpiration(
    refreshTokenIssuedAt,
    TOKEN_EXPIRATION.REFRESH_TOKEN_MS,
  );

  // early return: refresh token expired
  if (refreshInfo.status === TokenStatus.EXPIRED) {
    return 0;
  }

  // early return: access token should be refreshed
  if (accessInfo.shouldRefresh) {
    return Math.min(accessInfo.timeRemaining, DEFAULT_CHECK_INTERVAL);
  }

  const timeUntilAccessRefresh = accessInfo.timeRemaining - TOKEN_EXPIRATION.REFRESH_BUFFER_MS;

  // early return: time until access refresh is negative or very small
  if (timeUntilAccessRefresh <= 0) {
    return DEFAULT_CHECK_INTERVAL;
  }

  return Math.min(timeUntilAccessRefresh, DEFAULT_CHECK_INTERVAL);
}
