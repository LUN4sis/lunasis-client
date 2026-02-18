'use client';

import { useAuthHydrationStore } from '../stores/use-auth-hydration-store';

/**
 * Returns true when the auth store has been rehydrated from localStorage.
 * Use this to avoid reading auth state before persist has loaded (e.g. to prevent flash of wrong UI).
 */
export function useAuthStoreHydration() {
  return useAuthHydrationStore((state) => state.hasHydrated);
}
