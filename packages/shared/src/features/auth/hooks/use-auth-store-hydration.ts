'use client';

import { useAuthStore } from '../stores';

/**
 * Track zustand auth store hydration status
 * Returns true when the store has been rehydrated from localStorage
 *
 * This hook uses the _hasHydrated flag set by onRehydrateStorage
 * to ensure we only use auth state after persist middleware has loaded from storage
 */
export function useAuthStoreHydration() {
  return useAuthStore((state) => state._hasHydrated);
}
