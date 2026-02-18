import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthState } from '../types/auth.type';

const initialState: Pick<
  AuthState,
  'isLoggedIn' | 'accessToken' | 'refreshToken' | 'nickname' | 'firstLogin' | 'privateChat'
> = {
  isLoggedIn: false,

  accessToken: null,
  refreshToken: null,

  nickname: null,
  firstLogin: false,
  privateChat: false,
<<<<<<< HEAD
  isLoggedIn: false,
  _hasHydrated: false,
=======
>>>>>>> 5955747d69fc94c0c7ce03f637ba16b9cd3e0558
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,

      updateTokens: (tokens) => {
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isLoggedIn: true,
        });
      },

      setProfile: (profile) =>
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
      storage: createJSONStorage(() => window.localStorage),

      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        nickname: state.nickname,
        firstLogin: state.firstLogin,
        privateChat: state.privateChat,
        isLoggedIn: state.isLoggedIn,
      }),

<<<<<<< HEAD
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
=======
      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') return initialState;
>>>>>>> 5955747d69fc94c0c7ce03f637ba16b9cd3e0558

        const state = persistedState as Partial<AuthState>;

        return {
          ...initialState,
          ...state,
          isLoggedIn: !!state.accessToken,
        };
      },
<<<<<<< HEAD
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.warn('[auth-storage] Rehydration error:', error);
        }
        // Directly mutate state (allowed in onRehydrateStorage callback)
=======

      onRehydrateStorage: () => (state) => {
>>>>>>> 5955747d69fc94c0c7ce03f637ba16b9cd3e0558
        if (state) {
          // Prefer token presence; fall back to persisted isLoggedIn (e.g. legacy or token-less persist)
          state.isLoggedIn = state.accessToken != null ? true : state.isLoggedIn;
          state._hasHydrated = true;
        }
      },
    },
  ),
);
