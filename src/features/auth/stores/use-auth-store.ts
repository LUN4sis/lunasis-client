import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { logger } from '@/lib/utils/logger';

import type { AuthStoreState } from '../types/auth.type';

/**
 * check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const testKey = '__test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,
      nickname: null,
      privateChat: null,
      firstLogin: null,

      updateTokens: (tokens) => {
        set((state) => ({
          ...state,
          accessToken: tokens.accessToken ?? state.accessToken,
          refreshToken: tokens.refreshToken ?? state.refreshToken,
          isLoggedIn: !!(tokens.accessToken ?? state.accessToken),
        }));
      },

      setProfile: (profile) => {
        set((state) => ({
          ...state,
          nickname: profile.nickname ?? state.nickname,
          privateChat: profile.privateChat ?? state.privateChat,
          firstLogin: profile.firstLogin ?? state.firstLogin,
        }));
      },

      clearAuth: () => {
        set({
          accessToken: null,
          refreshToken: null,
          isLoggedIn: false,
          nickname: null,
          privateChat: null,
          firstLogin: null,
        });
      },
    }),
    {
      name: 'auth-storage',
      // fallback to sessionStorage if localStorage is not available
      storage: createJSONStorage(() => (isLocalStorageAvailable() ? localStorage : sessionStorage)),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        nickname: state.nickname,
        privateChat: state.privateChat,
        firstLogin: state.firstLogin,
      }),
      // sync isLoggedIn with token existence after rehydration
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
