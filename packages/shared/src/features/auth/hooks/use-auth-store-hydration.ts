'use client';

import { useEffect, useState } from 'react';

/**
 * Track zustand auth store hydration status
 * Returns true when the store has been rehydrated from localStorage
 */
export function useAuthStoreHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after initial render
    // This ensures we wait for zustand persist to rehydrate from localStorage
    setHydrated(true);
  }, []);

  return hydrated;
}
