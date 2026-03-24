import { useChatStore } from '../stores/use-chat-store';
import type { PendingMessage } from '../types';

describe('useChatStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useChatStore.getState().reset();
  });

  describe('toggleIncognito', () => {
    it('should toggle isIncognito state from false to true', () => {
      const { toggleIncognito } = useChatStore.getState();

      expect(useChatStore.getState().isIncognito).toBe(false);

      toggleIncognito();

      expect(useChatStore.getState().isIncognito).toBe(true);
    });

    it('should toggle isIncognito state from true to false', () => {
      const { toggleIncognito } = useChatStore.getState();

      // First toggle to true
      toggleIncognito();
      expect(useChatStore.getState().isIncognito).toBe(true);

      // Second toggle back to false
      toggleIncognito();
      expect(useChatStore.getState().isIncognito).toBe(false);
    });

    it('should reset currentChatId to null when entering incognito mode', () => {
      const { setCurrentChatId, toggleIncognito } = useChatStore.getState();

      // Setup: have an active chat
      setCurrentChatId('chat-123');
      expect(useChatStore.getState().currentChatId).toBe('chat-123');

      // Act: toggle to incognito
      toggleIncognito();

      // Assert: chat ID is cleared
      expect(useChatStore.getState().isIncognito).toBe(true);
      expect(useChatStore.getState().currentChatId).toBeNull();
    });

    it('should reset currentChatId to null when exiting incognito mode', () => {
      const { setCurrentChatId, toggleIncognito } = useChatStore.getState();

      // Setup: enter incognito mode and set a chat ID
      toggleIncognito();
      setCurrentChatId('incognito-chat-456');
      expect(useChatStore.getState().currentChatId).toBe('incognito-chat-456');

      // Act: exit incognito mode
      toggleIncognito();

      // Assert: chat ID is cleared when returning to normal mode
      expect(useChatStore.getState().isIncognito).toBe(false);
      expect(useChatStore.getState().currentChatId).toBeNull();
    });

    it('should clear pendingMessages when entering incognito mode', () => {
      const { setPendingMessages, toggleIncognito } = useChatStore.getState();

      // Setup: have pending messages
      const pendingMsg: PendingMessage = {
        question: 'test question',
        answer: 'test answer',
        timestamp: new Date(),
      };
      setPendingMessages(pendingMsg);
      expect(useChatStore.getState().pendingMessages).toEqual(pendingMsg);

      // Act: toggle to incognito
      toggleIncognito();

      // Assert: pending messages are cleared
      expect(useChatStore.getState().pendingMessages).toBeNull();
    });

    it('should clear pendingMessages when exiting incognito mode', () => {
      const { setPendingMessages, toggleIncognito } = useChatStore.getState();

      // Setup: enter incognito and set pending messages
      toggleIncognito();
      const pendingMsg: PendingMessage = {
        question: 'incognito question',
        answer: 'incognito answer',
        timestamp: new Date(),
      };
      setPendingMessages(pendingMsg);
      expect(useChatStore.getState().pendingMessages).toEqual(pendingMsg);

      // Act: exit incognito
      toggleIncognito();

      // Assert: pending messages are cleared
      expect(useChatStore.getState().pendingMessages).toBeNull();
    });

    it('should reset both currentChatId and pendingMessages in a single toggle', () => {
      const { setCurrentChatId, setPendingMessages, toggleIncognito } = useChatStore.getState();

      // Setup: active chat with pending messages
      setCurrentChatId('chat-789');
      const pendingMsg: PendingMessage = {
        question: 'test',
        answer: 'answer',
        timestamp: new Date(),
      };
      setPendingMessages(pendingMsg);

      // Verify setup
      expect(useChatStore.getState().currentChatId).toBe('chat-789');
      expect(useChatStore.getState().pendingMessages).toEqual(pendingMsg);

      // Act: toggle incognito
      toggleIncognito();

      // Assert: both fields are reset
      expect(useChatStore.getState().isIncognito).toBe(true);
      expect(useChatStore.getState().currentChatId).toBeNull();
      expect(useChatStore.getState().pendingMessages).toBeNull();
    });

    it('should preserve other state values when toggling incognito', () => {
      const { toggleWebSearch, toggleSidebar, toggleIncognito } = useChatStore.getState();

      // Setup: change other state values
      toggleWebSearch();
      toggleSidebar();

      const beforeToggle = {
        isWebSearchEnabled: useChatStore.getState().isWebSearchEnabled,
        isSidebarOpen: useChatStore.getState().isSidebarOpen,
        isAlertOpen: useChatStore.getState().isAlertOpen,
      };

      // Act: toggle incognito
      toggleIncognito();

      // Assert: other state values are preserved
      expect(useChatStore.getState().isWebSearchEnabled).toBe(beforeToggle.isWebSearchEnabled);
      expect(useChatStore.getState().isSidebarOpen).toBe(beforeToggle.isSidebarOpen);
      expect(useChatStore.getState().isAlertOpen).toBe(beforeToggle.isAlertOpen);
    });
  });

  describe('other store actions', () => {
    it('should set current chat ID', () => {
      const { setCurrentChatId } = useChatStore.getState();

      setCurrentChatId('new-chat-id');

      expect(useChatStore.getState().currentChatId).toBe('new-chat-id');
    });

    it('should toggle sidebar', () => {
      const { toggleSidebar } = useChatStore.getState();

      expect(useChatStore.getState().isSidebarOpen).toBe(false);

      toggleSidebar();
      expect(useChatStore.getState().isSidebarOpen).toBe(true);

      toggleSidebar();
      expect(useChatStore.getState().isSidebarOpen).toBe(false);
    });

    it('should toggle web search', () => {
      const { toggleWebSearch } = useChatStore.getState();

      expect(useChatStore.getState().isWebSearchEnabled).toBe(false);

      toggleWebSearch();
      expect(useChatStore.getState().isWebSearchEnabled).toBe(true);

      toggleWebSearch();
      expect(useChatStore.getState().isWebSearchEnabled).toBe(false);
    });

    it('should set and clear pending messages', () => {
      const { setPendingMessages, clearPendingMessages } = useChatStore.getState();

      const message: PendingMessage = {
        question: 'Q',
        answer: 'A',
        timestamp: new Date(),
      };

      setPendingMessages(message);
      expect(useChatStore.getState().pendingMessages).toEqual(message);

      clearPendingMessages();
      expect(useChatStore.getState().pendingMessages).toBeNull();
    });

    it('should reset store to initial state', () => {
      const { setCurrentChatId, toggleIncognito, setPendingMessages, reset } =
        useChatStore.getState();

      // Change some state
      setCurrentChatId('chat-id');
      toggleIncognito();
      setPendingMessages({ question: 'Q', answer: 'A', timestamp: new Date() });

      // Reset
      reset();

      // All state should be back to initial values (except isHydrated)
      expect(useChatStore.getState().currentChatId).toBeNull();
      expect(useChatStore.getState().isIncognito).toBe(false);
      expect(useChatStore.getState().pendingMessages).toBeNull();
      expect(useChatStore.getState().isHydrated).toBe(true); // preserved by reset()
    });
  });
});
