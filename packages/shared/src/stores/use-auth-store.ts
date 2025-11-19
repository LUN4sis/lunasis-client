import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthStoreState } from '../types/auth.type';
import { logger, isLocalStorageAvailable } from '../utils';

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      accessTokenIssuedAt: null,
      refreshTokenIssuedAt: null,
      isLoggedIn: false,
      nickname: null,
      privateChat: null,
      firstLogin: null,

      // update tokens
      updateTokens: (tokens) => {
        const now = Date.now();
        set((state) => {
          const hasNewAccessToken = tokens.accessToken !== undefined;
          const hasNewRefreshToken = tokens.refreshToken !== undefined;

          return {
            ...state,
            accessToken: tokens.accessToken ?? state.accessToken,
            refreshToken: tokens.refreshToken ?? state.refreshToken,
            // update timestamp if new token is provided
            accessTokenIssuedAt: hasNewAccessToken ? now : state.accessTokenIssuedAt,
            refreshTokenIssuedAt: hasNewRefreshToken ? now : state.refreshTokenIssuedAt,
            isLoggedIn: !!(tokens.accessToken ?? state.accessToken),
          };
        });
      },

      // set profile
      setProfile: (profile) => {
        set((state) => ({
          ...state,
          nickname: profile.nickname ?? state.nickname,
          privateChat: profile.privateChat ?? state.privateChat,
          firstLogin: profile.firstLogin ?? state.firstLogin,
        }));
      },

      // clear auth
      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          accessTokenIssuedAt: null,
          refreshTokenIssuedAt: null,
          isLoggedIn: false,
          nickname: null,
          privateChat: null,
          firstLogin: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      version: 1,
      // fallback to sessionStorage if localStorage is not available
      storage: createJSONStorage(() => (isLocalStorageAvailable() ? localStorage : sessionStorage)),
      // select states to save
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenIssuedAt: state.accessTokenIssuedAt,
        refreshTokenIssuedAt: state.refreshTokenIssuedAt,
        nickname: state.nickname,
        privateChat: state.privateChat,
        firstLogin: state.firstLogin,
      }),
      // migrate state
      migrate: (persistedState: any, version: number) => {
        // return null if no persisted state
        if (!persistedState) {
          return null;
        }

        // migrate from version 0 to version 1
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

        // return persisted state for version 1 or higher
        return persistedState;
      },
      // sync isLoggedIn after rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoggedIn = !!state.accessToken;
          logger.log('[AuthStore] Rehydrated from storage:', {
            hasAccessToken: !!state.accessToken,
            hasRefreshToken: !!state.refreshToken,
            isLoggedIn: state.isLoggedIn,
            nickname: state.nickname,
          });
        } else {
          logger.warn('[AuthStore] Failed to rehydrate from storage');
        }
      },
    },
  ),
);
