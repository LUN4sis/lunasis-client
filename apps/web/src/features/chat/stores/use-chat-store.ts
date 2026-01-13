import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatStore } from '../types';

const initialState = {
  currentChatId: null,
  isIncognito: false,
  isSidebarOpen: false,
  isWebSearchEnabled: false,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentChatId: (id: string | null) => set({ currentChatId: id }),
      toggleIncognito: () => set((state) => ({ isIncognito: !state.isIncognito })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),
      reset: () => set(initialState),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage<ChatStore>(() => localStorage),
    },
  ),
);
