import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isLocalStorageAvailable, logger } from '@repo/shared/utils';

import type { BirthDateSelection, OnboardingState } from '../types/onboarding.type';

interface OnboardingStoreState extends OnboardingState {
  setNickname: (nickname: string) => void;
  setAge: (age: number) => void;
  setBirthDateSelection: (birthDateSelection: BirthDateSelection) => void;
  resetOnboarding: () => void;
}

const initialState: Omit<
  OnboardingState,
  keyof Pick<
    OnboardingStoreState,
    'setNickname' | 'setAge' | 'setBirthDateSelection' | 'resetOnboarding'
  >
> = {
  nickname: '',
  age: 0,
  birthDateSelection: { year: '', month: '', day: '' },
};

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setNickname: (nickname) => set({ nickname }),
      setAge: (age) => set({ age }),
      setBirthDateSelection: (birthDateSelection) => set({ birthDateSelection }),
      resetOnboarding: () => set(initialState),
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => (isLocalStorageAvailable() ? localStorage : sessionStorage)),
      partialize: (state) => ({
        nickname: state.nickname,
        age: state.age,
        birthDateSelection: state.birthDateSelection,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.info('[OnboardingStore] Rehydrated from storage:', {
            nickname: state.nickname,
          });
        } else {
          logger.warn('[OnboardingStore] Failed to rehydrate from storage');
        }
      },
    },
  ),
);
