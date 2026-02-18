import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthProfile, AuthState, TokenUpdatePayload } from '../types/store.type';

const initialState = {
  accessToken: null,
  refreshToken: null,
  accessTokenIssuedAt: null,
  refreshTokenIssuedAt: null,
  nickname: null,
  firstLogin: false,
  privateChat: false,
  isLoggedIn: false,
  _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      updateTokens: (tokens: TokenUpdatePayload) =>
        set((state) => ({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          accessTokenIssuedAt: tokens.accessTokenIssuedAt ?? Date.now(),
          refreshTokenIssuedAt:
            tokens.refreshTokenIssuedAt ?? state.refreshTokenIssuedAt ?? Date.now(),
          isLoggedIn: true,
        })),

      setProfile: (profile: AuthProfile) =>
        set({
          nickname: profile.nickname,
          firstLogin: profile.firstLogin,
          privateChat: profile.privateChat,
        }),

      clearAuth: () => set({ ...initialState, _hasHydrated: true }),

      setHasHydrated: (hasHydrated: boolean) => set({ _hasHydrated: hasHydrated }),
    }),
    {
      name: 'auth-storage',
      version: 1,
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        accessTokenIssuedAt: state.accessTokenIssuedAt,
        refreshTokenIssuedAt: state.refreshTokenIssuedAt,
        nickname: state.nickname,
        firstLogin: state.firstLogin,
        privateChat: state.privateChat,
        isLoggedIn: state.isLoggedIn,
      }),
      migrate: (persistedState: any, version: number) => {
        if (!persistedState) {
          return null;
        }

        if (version === 0) {
          return {
            accessToken: persistedState?.accessToken ?? null,
            refreshToken: persistedState?.refreshToken ?? null,
            accessTokenIssuedAt: persistedState?.accessTokenIssuedAt ?? null,
            refreshTokenIssuedAt: persistedState?.refreshTokenIssuedAt ?? null,
            nickname: persistedState?.nickname ?? null,
            privateChat: persistedState?.privateChat ?? false,
            firstLogin: persistedState?.firstLogin ?? false,
          };
        }

        return persistedState;
      },
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[auth-storage] Rehydration error:', error);
        }
        // Directly mutate state (allowed in onRehydrateStorage callback)
        if (state) {
          // Prefer token presence; fall back to persisted isLoggedIn (e.g. legacy or token-less persist)
          state.isLoggedIn = state.accessToken != null ? true : state.isLoggedIn;
          state._hasHydrated = true;
        }
      },
    },
  ),
);
