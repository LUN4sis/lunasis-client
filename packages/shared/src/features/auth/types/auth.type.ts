/**
 * OAuth Token Exchange Response
 */
export interface ExchangeResponse {
  accessToken: string;
  refreshToken: string;
  firstLogin: boolean;
  nickname: string;
  privateChat: boolean;
}

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
