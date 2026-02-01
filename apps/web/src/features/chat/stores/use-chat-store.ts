import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { ChatState, ChatStore, PendingMessage } from '../types';

const initialState = {
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

      setCurrentChatId: (id: string | null) => set({ currentChatId: id }),
      toggleIncognito: () => set((state) => ({ isIncognito: !state.isIncognito })),
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      toggleWebSearch: () => set((state) => ({ isWebSearchEnabled: !state.isWebSearchEnabled })),
      setAlertOpen: (open: boolean) => set({ isAlertOpen: open }),
      setPendingMessages: (messages: PendingMessage | null) => set({ pendingMessages: messages }),
      clearPendingMessages: () => set({ pendingMessages: null }),
      reset: () => set({ ...initialState, isHydrated: true }),
      setHydrated: (hydrated: boolean) => set({ isHydrated: hydrated }),
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
        const {
          pendingMessages: _pm,
          anonymousUserId: _au,
          isHydrated: _ih,
          ...rest
        } = state as ChatState & {
          anonymousUserId?: string | null;
          isHydrated?: boolean;
        };
        void _pm;
        void _au;
        void _ih;
        return rest as ChatState & { pendingMessages: null };
      },
      onRehydrateStorage: () => (_state, error) => {
        // rehydration 실패 시에도 UI 표시 (기본 state로), 콜백 미호출 대비
        useChatStore.setState({ isHydrated: true });
        if (error) {
          console.warn('[chat-store] Rehydration error:', error);
        }
      },
    },
  ),
);
