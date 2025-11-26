/**
 * Auth Profile
 */
export interface AuthProfile {
  nickname: string | null;
  privateChat: boolean;
  firstLogin: boolean;
}

export interface TokenUpdatePayload {
  accessToken: string;
  refreshToken: string;
  accessTokenIssuedAt?: number;
  refreshTokenIssuedAt?: number;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenIssuedAt: number | null;
  refreshTokenIssuedAt: number | null;

  nickname: string | null;
  privateChat: boolean;
  firstLogin: boolean;

  isLoggedIn: boolean;

  updateTokens: (payload: TokenUpdatePayload) => void;
  setProfile: (profile: AuthProfile) => void;
  clearAuth: () => void;
}
