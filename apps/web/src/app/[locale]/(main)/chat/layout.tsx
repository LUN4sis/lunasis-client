'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { ChatHeader } from '@web/features/chat/components/chat-header';
import { ChatInput } from '@web/features/chat/components/chat-input';
import { IncognitoBar } from '@web/features/chat/components/incognito-bar';
import { Sidebar } from '@web/features/chat/components/sidebar';
import { ChatLayoutProvider, useChatLayout } from '@web/features/chat/contexts';
import { useChatStore } from '@web/features/chat/stores';

import clsx from 'clsx';
import styles from './layout.module.scss';

function ChatLayoutInner({ children }: { children: React.ReactNode }) {
  const { isIncognito } = useChatStore();
  const { handleSend, isLoading } = useChatLayout();
  const pathname = usePathname();
  const isSettingsPage = pathname.includes('/chat/settings');

  // hide bottom nav
  useEffect(() => {
    document.documentElement.style.setProperty('--bottom-nav-height', '0px');
    document.documentElement.style.setProperty('--bottom-nav-display', 'none');

    return () => {
      // restore
      document.documentElement.style.setProperty('--bottom-nav-height', '56px');
      document.documentElement.style.setProperty('--bottom-nav-display', 'flex');
    };
  }, []);

  return (
    <div className={styles.container}>
      <Sidebar />

      {!isSettingsPage && (
        <div className={styles.top}>
          <ChatHeader />
          <IncognitoBar />
        </div>
      )}

      <div
        className={clsx(styles.chatContainer, {
          [styles.incognito]: isIncognito && !isSettingsPage,
        })}
      >
        {children}
      </div>

      {!isSettingsPage && (
        <div className={styles.bottom}>
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      )}
    </div>
  );
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChatLayoutProvider>
      <ChatLayoutInner>{children}</ChatLayoutInner>
    </ChatLayoutProvider>
  );
}
