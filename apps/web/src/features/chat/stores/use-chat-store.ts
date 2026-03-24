import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { logger } from '@repo/shared/utils';

import type { ChatState, ChatStore, PendingMessage } from '../types';

// exclude pending messages and hydration status from persistence
type PersistedChatState = Omit<ChatState, 'pendingMessages' | 'isHydrated'>;

const initialState: ChatState = {
  currentChatId: null,
  isIncognito: false,
  isSidebarOpen: false,
  isWebSearchEnabled: false,
  isAlertOpen: false,
  pendingMessages: null,
  isHydrated: false,
};

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      ...initialState,

      // null: new chatRoom
      setCurrentChatId: (id: string | null) => set({ currentChatId: id }),

      toggleIncognito: () =>
        set((state) => ({
          isIncognito: !state.isIncognito,
          currentChatId: null,
          pendingMessages: null,
        })),

      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),
      setAlertOpen: (open: boolean) => set({ isAlertOpen: open }),
      // for chatroom create
      setPendingMessages: (messages: PendingMessage | null) => set({ pendingMessages: messages }),
      clearPendingMessages: () => set({ pendingMessages: null }),
      reset: () => set({ ...initialState, isHydrated: true }),
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
    }),
    {
      name: 'chat-store',
      storage: createJSONStorage<PersistedChatState>(() => {
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
        const { pendingMessages, isHydrated, ...rest } = state;
        return rest as PersistedChatState;
      },

      // callback for hydration completion
      onRehydrateStorage: () => (_state, error) => {
        useChatStore.setState({ isHydrated: true });
        if (error) {
          logger.warn('[chat-store] Rehydration error', { error });
        }
      },
    },
  ),
);
