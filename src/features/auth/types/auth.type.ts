import type { ErrorCode } from '@/types/error';

export interface Tokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface UserProfile {
  nickname?: string | null;
  privateChat?: boolean | null;
}

export interface ExchangeResponse {
  refreshToken: string;
  accessToken: string;
  firstLogin: boolean;
  nickname: string | null;
  privateChat: boolean | null;
}

export interface ServerActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ErrorCode;
    message: string;
  };
}

export type ExchangeTokenResult = ServerActionResponse<ExchangeResponse>;

export interface AuthStoreState extends Tokens, UserProfile {
  isLoggedIn: boolean;
  firstLogin?: boolean | null;
  updateTokens: (tokens: Partial<Tokens>) => void;
  setProfile: (profile: Partial<UserProfile> & { firstLogin?: boolean }) => void;
  clearAuth: () => void;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export function toTokens(
  response: RefreshTokenResponse,
  fallbackRefreshToken?: string | null,
): Tokens {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken ?? fallbackRefreshToken ?? null,
  };
}
