import { create } from 'zustand';

interface AuthHydrationState {
  hasHydrated: boolean;
  setHydrated: () => void;
}

export const useAuthHydrationStore = create<AuthHydrationState>((set) => ({
  hasHydrated: false,
  setHydrated: () => set({ hasHydrated: true }),
}));
