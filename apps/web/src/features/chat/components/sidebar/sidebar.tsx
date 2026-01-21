'use client';

import { useEffect, useState } from 'react';
import { XIcon, PlusIcon, MessageSquareIcon, EyeOffIcon } from 'lucide-react';
import { Button } from '@web/components/ui/button/button';

import { useAuthStore } from '@repo/shared/features/auth/stores/use-auth-store';
import { useChatStore } from '../../stores/use-chat-store';
import { mockGetChatRooms } from '../../api/mock-chat-api';

import styles from './sidebar.module.scss';

interface ChatRoomItem {
  chatRoomId: string;
  title: string;
}

export const Sidebar = () => {
  const isSidebarOpen = useChatStore((state) => state.isSidebarOpen);
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const isIncognito = useChatStore((state) => state.isIncognito);

  const { isLoggedIn } = useAuthStore();

  const [chatRooms, setChatRooms] = useState<ChatRoomItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch chat rooms when sidebar opens
  useEffect(() => {
    if (isSidebarOpen && !isIncognito) {
      const fetchChatRooms = async () => {
        setIsLoading(true);
        try {
          const rooms = await mockGetChatRooms();
          setChatRooms(rooms);
        } catch (error) {
          console.error('Failed to fetch chat rooms:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchChatRooms();
    }
  }, [isSidebarOpen, isIncognito]);

  const handleSelectChat = (chatRoomId: string) => {
    setCurrentChatId(chatRoomId);
    toggleSidebar();
  };

  const handleNewChat = () => {
    setCurrentChatId(null);
    toggleSidebar();
  };

  const handleOverlayClick = () => {
    toggleSidebar();
  };

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isSidebarOpen) {
        toggleSidebar();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, toggleSidebar]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isSidebarOpen]);

  // hide sidebar(not logged in)
  if (!isLoggedIn) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${isSidebarOpen ? styles.overlayVisible : ''}`}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />

      {/* Sidebar Panel */}
      <aside
        className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Chat sidebar"
      >
        {/* Header */}
        <header className={styles.header}>
          {isLoggedIn && (
            <Button
              variant="ghost"
              fullWidth={false}
              onClick={toggleSidebar}
              aria-label="Close sidebar"
            >
              <XIcon />
            </Button>
          )}
          <h2 className={styles.headerTitle}>Chats</h2>
          <Button variant="ghost" fullWidth={false} onClick={handleNewChat} aria-label="New chat">
            <PlusIcon />
          </Button>
        </header>

        {/* Content */}
        <div className={styles.content}>
          {isIncognito ? (
            <div className={styles.incognitoMessage}>
              <EyeOffIcon className={styles.incognitoIcon} />
              <p>Incognito Mode</p>
              <span>Chat history is not saved in incognito mode.</span>
            </div>
          ) : isLoading ? (
            <div className={styles.loading}>
              <div className={styles.loadingSpinner} />
              <span>Loading chats...</span>
            </div>
          ) : chatRooms.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageSquareIcon className={styles.emptyIcon} />
              <p>No chat history</p>
              <span>Start a new conversation!</span>
            </div>
          ) : (
            <ul className={styles.chatList}>
              {chatRooms.map((room) => (
                <li key={room.chatRoomId}>
                  <button
                    className={`${styles.chatItem} ${
                      currentChatId === room.chatRoomId ? styles.chatItemActive : ''
                    }`}
                    onClick={() => handleSelectChat(room.chatRoomId)}
                  >
                    <MessageSquareIcon className={styles.chatItemIcon} />
                    <span className={styles.chatItemTitle}>{room.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer - Incognito indicator */}
        {isIncognito && (
          <footer className={styles.footer}>
            <div className={styles.incognitoBadge}>
              <EyeOffIcon />
              <span>Incognito Active</span>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
};
