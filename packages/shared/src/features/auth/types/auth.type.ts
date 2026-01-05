/**
 * Login Response (also used as ExchangeResponse)
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  firstLogin: boolean;
  nickname: string;
  privateChat: boolean;
}

/**
 * Type alias for backward compatibility
 */
export type ExchangeResponse = LoginResponse;

/**
 * Token Refresh Response
 */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Token Pair
 */
export interface TokenPair {
  accessToken: string | null;
  refreshToken: string | null;
}

/**
 * Convert API response to TokenPair
 */
export function toTokens(
  response: { data?: RefreshTokenResponse },
  currentRefreshToken: string,
): TokenPair {
  if (!response.data) {
    return { accessToken: null, refreshToken: null };
  }

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken ?? currentRefreshToken,
  };
}
