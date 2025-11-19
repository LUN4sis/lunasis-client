/**
 * React Native용 스토리지 어댑터
 * Zustand persist 미들웨어에서 사용할 수 있는 AsyncStorage 어댑터
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

/**
 * AsyncStorage를 Zustand persist 미들웨어에서 사용할 수 있도록 어댑터 생성
 *
 * @example
 * ```typescript
 * import { create } from 'zustand';
 * import { persist } from 'zustand/middleware';
 * import { asyncStorageAdapter } from '@/src/lib/storage-adapter';
 *
 * const useStore = create(
 *   persist(
 *     (set) => ({ ... }),
 *     {
 *       name: 'my-storage',
 *       storage: asyncStorageAdapter,
 *     }
 *   )
 * );
 * ```
 */
export const asyncStorageAdapter: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (error) {
      console.error(`[StorageAdapter] Failed to get item "${name}":`, error);
      return null;
    }
  },
  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (error) {
      console.error(`[StorageAdapter] Failed to set item "${name}":`, error);
    }
  },
  removeItem: async (name: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (error) {
      console.error(`[StorageAdapter] Failed to remove item "${name}":`, error);
    }
  },
};
