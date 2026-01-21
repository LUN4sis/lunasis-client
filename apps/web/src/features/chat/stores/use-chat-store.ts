import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ChatState, ChatStore, PendingMessage } from '../types';

const initialState = {
  currentChatId: null,
  isIncognito: false,
  isSidebarOpen: false,
  isWebSearchEnabled: false,
  isAlertOpen: false,
  anonymousUserId: null,
  pendingMessages: null,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentChatId: (id: string | null) => set({ currentChatId: id }),
      toggleIncognito: () => set((state) => ({ isIncognito: !state.isIncognito })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),
      setAlertOpen: (open: boolean) => set({ isAlertOpen: open }),
      setAnonymousUserId: (id: string | null) => set({ anonymousUserId: id }),
      setPendingMessages: (messages: PendingMessage | null) => set({ pendingMessages: messages }),
      clearPendingMessages: () => set({ pendingMessages: null }),
      reset: () => set(initialState),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage<ChatState>(() => {
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
        const { pendingMessages, ...rest } = state as ChatState;
        return rest as ChatState & { pendingMessages: null };
      },
    },
  ),
);
