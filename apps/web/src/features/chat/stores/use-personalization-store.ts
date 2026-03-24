import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { logger } from '@repo/shared/utils';

import type { PersonalizationState, PersonalizationStore, SavedMemory, ToneLevel } from '../types';

type PersistedPersonalizationState = Omit<PersonalizationState, 'isHydrated'>;

const initialState: PersonalizationState = {
  chatNickName: '',
  warmth: 'DEFAULT',
  enthusiastic: 'DEFAULT',
  formal: 'DEFAULT',
  personalSetting: '',
  savedMemories: [],
  isHydrated: false,
};

export const usePersonalizationStore = create<PersonalizationStore>()(
  persist(
    (set) => ({
      ...initialState,

      setChatNickName: (name: string) => set({ chatNickName: name }),

      setWarmth: (level: ToneLevel) => set({ warmth: level }),

      setEnthusiastic: (level: ToneLevel) => set({ enthusiastic: level }),

      setFormal: (level: ToneLevel) => set({ formal: level }),

      setPersonalSetting: (setting: string) => set({ personalSetting: setting }),

      setSavedMemories: (memories: SavedMemory[]) => set({ savedMemories: memories }),

      removeMemory: (savedMemoryId: string) =>
        set((state) => ({
          savedMemories: state.savedMemories.filter((m) => m.savedMemoryId !== savedMemoryId),
        })),

      reset: () => set({ ...initialState, isHydrated: true }),

      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'personalization-store',

      storage: createJSONStorage<PersistedPersonalizationState>(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage;
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),

      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { isHydrated, ...rest } = state;
        return rest as PersistedPersonalizationState;
      },

      onRehydrateStorage: () => (_state, error) => {
        usePersonalizationStore.setState({ isHydrated: true });
        if (error) {
          logger.warn('[personalization-store] Rehydration error', { error });
        }
      },
    },
  ),
);
