/**
 * Mobile 앱용 인증 스토어
 * React Native AsyncStorage를 사용하는 인증 스토어
 */

import { asyncStorageAdapter } from '@/src/lib/storage-adapter';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AuthProfile,
  AuthState,
  TokenUpdatePayload,
} from '@repo/shared/features/auth/types/store.type';

/**
 * 인증 스토어 (React Native용)
 * AsyncStorage를 사용하여 인증 상태를 영구 저장
 *
 * @example
 * ```typescript
 * import { useAuthStore } from '@/src/stores/use-auth-store';
 *
 * function MyComponent() {
 *   const isLoggedIn = useAuthStore((state) => state.isLoggedIn);
 *   const updateTokens = useAuthStore((state) => state.updateTokens);
 *   const clearAuth = useAuthStore((state) => state.clearAuth);
 *
 *   // 토큰 업데이트
 *   updateTokens({ accessToken: 'new-token', refreshToken: 'new-refresh' });
 *
 *   // 로그아웃
 *   clearAuth();
 *
 *   return <div>{isLoggedIn ? 'Logged In' : 'Logged Out'}</div>;
 * }
 * ```
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      accessTokenIssuedAt: null,
      refreshTokenIssuedAt: null,
      isLoggedIn: false,
      nickname: null,
      privateChat: false,
      firstLogin: false,

      /**
       * 토큰 업데이트
       */
      updateTokens: (payload: TokenUpdatePayload) => {
        const now = Date.now();
        set({
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
          accessTokenIssuedAt: payload.accessTokenIssuedAt ?? now,
          refreshTokenIssuedAt: payload.refreshTokenIssuedAt ?? now,
          isLoggedIn: true,
        });
      },

      /**
       * 프로필 설정
       */
      setProfile: (profile: AuthProfile) => {
        set((state: AuthState) => ({
          ...state,
          nickname: profile.nickname,
          privateChat: profile.privateChat,
          firstLogin: profile.firstLogin,
        }));
      },

      /**
       * 인증 정보 초기화 (로그아웃)
       */
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenIssuedAt: null,
          refreshTokenIssuedAt: null,
          isLoggedIn: false,
          nickname: null,
          privateChat: false,
          firstLogin: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      // React Native AsyncStorage 사용
      storage: createJSONStorage(() => asyncStorageAdapter),
      // 저장할 상태 선택
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenIssuedAt: state.accessTokenIssuedAt,
        refreshTokenIssuedAt: state.refreshTokenIssuedAt,
        nickname: state.nickname,
        privateChat: state.privateChat,
        firstLogin: state.firstLogin,
      }),
      // 상태 마이그레이션
      migrate: (persistedState: any, version: number) => {
        // 저장된 상태가 없으면 null 반환하여 초기 상태 사용
        if (!persistedState) {
          return null;
        }

        // 버전 0 (버전 없음)에서 버전 1로 마이그레이션
        if (version === 0) {
          return {
            accessToken: persistedState?.accessToken ?? null,
            refreshToken: persistedState?.refreshToken ?? null,
            accessTokenIssuedAt: persistedState?.accessTokenIssuedAt ?? null,
            refreshTokenIssuedAt: persistedState?.refreshTokenIssuedAt ?? null,
            nickname: persistedState?.nickname ?? null,
            privateChat: persistedState?.privateChat ?? null,
            firstLogin: persistedState?.firstLogin ?? null,
          };
        }

        // 버전 1 이상은 그대로 반환
        return persistedState;
      },
      // 재수화 후 isLoggedIn 동기화
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoggedIn = !!state.accessToken;
          console.log('[AuthStore] Rehydrated from storage:', {
            hasAccessToken: !!state.accessToken,
            hasRefreshToken: !!state.refreshToken,
            isLoggedIn: state.isLoggedIn,
            nickname: state.nickname,
          });
        } else {
          console.warn('[AuthStore] Failed to rehydrate from storage');
        }
      },
    },
  ),
);
