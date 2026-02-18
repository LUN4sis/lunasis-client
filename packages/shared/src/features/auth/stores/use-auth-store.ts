import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthState } from '../types/auth.type';
import { useAuthHydrationStore } from './use-auth-hydration-store';

const initialState = {
  accessToken: null,
  refreshToken: null,
  accessTokenIssuedAt: null,
  refreshTokenIssuedAt: null,
  nickname: null,
  firstLogin: false,
  privateChat: false,
  isLoggedIn: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      updateTokens: (tokens: Pick<AuthState, 'accessToken' | 'refreshToken'>) =>
        set((state: AuthState) => ({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isLoggedIn: true,
        })),

      setProfile: (profile: Pick<AuthState, 'nickname' | 'firstLogin' | 'privateChat'>) =>
        set({
          nickname: profile.nickname,
          firstLogin: profile.firstLogin,
          privateChat: profile.privateChat,
        }),

      clearAuth: () => set({ ...initialState }),
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
        if (state) {
          // Prefer token presence; fall back to persisted isLoggedIn (e.g. legacy or token-less persist)
          state.isLoggedIn = state.accessToken != null ? true : state.isLoggedIn;
        }
        useAuthHydrationStore.getState().setHydrated();
      },
    },
  ),
);
