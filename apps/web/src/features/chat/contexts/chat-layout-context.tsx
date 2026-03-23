'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';

type HandleSend = (message: string, options: { webSearch: boolean; file: File | null }) => void;

interface ChatLayoutContextValue {
  handleSend: HandleSend;
  isLoading: boolean;
  setLayoutActions: (actions: { handleSend: HandleSend; isLoading: boolean }) => void;
}

const ChatLayoutContext = createContext<ChatLayoutContextValue | null>(null);

export function ChatLayoutProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleSendRef = useRef<HandleSend>(() => {});
  const isLoadingRef = useRef(false);

  const setLayoutActions = useCallback(
    (actions: { handleSend: HandleSend; isLoading: boolean }) => {
      handleSendRef.current = actions.handleSend;
      // Only trigger re-render when isLoading actually changes
      if (isLoadingRef.current !== actions.isLoading) {
        isLoadingRef.current = actions.isLoading;
        setIsLoading(actions.isLoading);
      }
    },
    [],
  );

  const handleSend: HandleSend = useCallback(
    (message, options) => handleSendRef.current(message, options),
    [],
  );

  return (
    <ChatLayoutContext.Provider value={{ handleSend, isLoading, setLayoutActions }}>
      {children}
    </ChatLayoutContext.Provider>
  );
}

export function useChatLayout() {
  const context = useContext(ChatLayoutContext);
  if (!context) {
    throw new Error('[chat-layout-context] useChatLayout must be used within ChatLayoutProvider');
  }
  return context;
}
