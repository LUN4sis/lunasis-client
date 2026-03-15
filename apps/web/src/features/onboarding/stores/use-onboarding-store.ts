import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { isLocalStorageAvailable, logger } from '@repo/shared/utils';

import { registerPreferencesAPI } from '../api/onboarding.api';
import type {
  BirthDateSelection,
  OnboardingState,
  PreferencesRequest,
  PreferencesState,
} from '../types/onboarding.type';

interface OnboardingStoreState extends OnboardingState {
  setNickname: (nickname: string) => void;
  setAge: (age: number) => void;
  setBirthDateSelection: (birthDateSelection: BirthDateSelection) => void;
  setPreferences: (update: Partial<PreferencesState>) => void;
  resetOnboarding: () => void;
  submitPreferences: (data: PreferencesRequest) => Promise<void>;
}

const initialPreferences: PreferencesState = {
  healthCareInterests: [],
  gynecologyInterests: [],
  hasVisited: null,
  hospitalPriorities: [],
  communityInterests: [],
  commerceInterests: [],
  productCategories: [],
};

const initialState: OnboardingState = {
  nickname: '',
  age: 0,
  birthDateSelection: { year: '', month: '', day: '' },
  preferences: initialPreferences,
};

export const useOnboardingStore = create<OnboardingStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      setNickname: (nickname) => set({ nickname }),
      setAge: (age) => set({ age }),
      setBirthDateSelection: (birthDateSelection) => set({ birthDateSelection }),
      setPreferences: (update) =>
        set((state) => ({ preferences: { ...state.preferences, ...update } })),
      resetOnboarding: () => set(initialState),
      submitPreferences: async (data: PreferencesRequest) => {
        await registerPreferencesAPI(data);
        set(initialState);
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => (isLocalStorageAvailable() ? localStorage : sessionStorage)),
      partialize: (state) => ({
        nickname: state.nickname,
        age: state.age,
        birthDateSelection: state.birthDateSelection,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          logger.info('[OnboardingStore] Rehydrated from storage:', {
            nickname: state.nickname,
            age: state.age,
          });
        } else {
          logger.warn('[OnboardingStore] Failed to rehydrate from storage');
        }
      },
    },
  ),
);
