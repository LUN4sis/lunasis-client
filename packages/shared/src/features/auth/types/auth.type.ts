export interface AuthSessionResponse {
  accessToken: string;
  refreshToken: string;
  nickname: string;
  privateChat: boolean;
  firstLogin: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

// for zustand
export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;

  nickname: string | null;
  privateChat: boolean;
  firstLogin: boolean;

  isLoggedIn: boolean;

  updateTokens: (tokens: Pick<AuthState, 'accessToken' | 'refreshToken'>) => void;
  setProfile: (profile: Pick<AuthState, 'nickname' | 'firstLogin' | 'privateChat'>) => void;
  clearAuth: () => void;
}
