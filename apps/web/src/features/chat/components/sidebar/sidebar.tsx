'use client';

import CreateIcon from '@mui/icons-material/Create';
import { getErrorMessage } from '@repo/shared/utils';
import { Button } from '@web/components/ui/button';
import clsx from 'clsx';
import { MenuIcon, MessageSquareIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { useChatRoomsQuery } from '../../hooks';
import { useChatStore } from '../../stores/use-chat-store';
import type { ChatRoomItem } from '../../types/chat.type';
import styles from './sidebar.module.scss';

export const Sidebar = () => {
  const t = useTranslations('chat.sidebar');
  const router = useRouter();

  const isSidebarOpen = useChatStore((state) => state.isSidebarOpen);
  const toggleSidebar = useChatStore((state) => state.toggleSidebar);
  const currentChatId = useChatStore((state) => state.currentChatId);
  const setCurrentChatId = useChatStore((state) => state.setCurrentChatId);
  const isIncognito = useChatStore((state) => state.isIncognito);

  const { data, isLoading, isError, error, refetch } = useChatRoomsQuery();

  const handleToggleSidebar = () => {
    toggleSidebar();
  };

  const handleCreateChat = () => {
    setCurrentChatId(null);
    router.push('/chat');
    handleToggleSidebar();
  };

  const handleClickChatRoom = (chatRoomId: string) => {
    setCurrentChatId(chatRoomId);
    router.push(`/chat/${chatRoomId}`);
    handleToggleSidebar();
  };

  const handleOverlayKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    handleToggleSidebar();
  };

  if (!isSidebarOpen) return null;

  const chatRooms: ChatRoomItem[] = data?.data ?? [];

  return (
    <div
      className={clsx(styles.overlay, { [styles.overlayVisible]: isSidebarOpen })}
      onClick={handleToggleSidebar}
      onKeyDown={handleOverlayKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Close sidebar overlay"
    >
      <aside
        className={clsx(styles.sidebar, { [styles.sidebarOpen]: isSidebarOpen })}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className={styles.header}>
          <Button
            variant="ghost"
            colorScheme="white"
            onClick={handleToggleSidebar}
            aria-label="Close sidebar"
            className={styles.toggleButton}
          >
            <MenuIcon />
          </Button>
          <Button
            variant="ghost"
            colorScheme="orange"
            onClick={handleCreateChat}
            aria-label="Create chat"
            disabled={isLoading}
            isLoading={isLoading}
            className={styles.createButton}
          >
            <CreateIcon />
          </Button>
        </header>

        <div className={styles.content}>
          {isLoading && (
            <div className={styles.loading}>
              <p>{t('loading')}</p>
            </div>
          )}

          {isError && (
            <div className={styles.error}>
              <p>{getErrorMessage(error)}</p>
              <Button variant="outline" colorScheme="white" onClick={() => refetch()}>
                {t('retry')}
              </Button>
            </div>
          )}

          {/* Chat list - only show when not in incognito mode */}
          {!isLoading && !isError && !isIncognito && (
            <>
              {chatRooms.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>{t('blank')}</p>
                  <span>{t('blankDescription')}</span>
                </div>
              ) : (
                <ul className={styles.chatList}>
                  {chatRooms.map((room) => (
                    <li key={room.chatRoomId}>
                      <button
                        className={clsx(styles.chatItem, {
                          [styles.chatItemActive]: currentChatId === room.chatRoomId,
                        })}
                        onClick={() => handleClickChatRoom(room.chatRoomId)}
                        type="button"
                      >
                        <MessageSquareIcon className={styles.chatItemIcon} />
                        <span className={styles.chatItemTitle}>{room.title}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {/* Incognito mode message */}
          {!isLoading && !isError && isIncognito && (
            <div className={styles.emptyState}>
              <p>{t('incognito')}</p>
              <span>{t('incognitoDescription')}</span>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
};
