import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AuthState } from '../types/auth.type';

const initialState: Pick<
  AuthState,
  'isLoggedIn' | 'accessToken' | 'refreshToken' | 'nickname' | 'firstLogin' | 'privateChat' | '_hasHydrated'
> = {
  isLoggedIn: false,
  accessToken: null,
  refreshToken: null,
  nickname: null,
  firstLogin: false,
  privateChat: false,
  _hasHydrated: false,
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

      migrate: (persistedState: unknown) => {
        if (!persistedState || typeof persistedState !== 'object') return initialState;

        const state = persistedState as Partial<AuthState>;

        return {
          ...initialState,
          ...state,
          isLoggedIn: !!state.accessToken,
        };
      },

      onRehydrateStorage: () => (state) => {
        if (state) {
          // Prefer token presence; fall back to persisted isLoggedIn (e.g. legacy or token-less persist)
          state.isLoggedIn = state.accessToken != null ? true : state.isLoggedIn;
        }
      },
    },
  ),
);
