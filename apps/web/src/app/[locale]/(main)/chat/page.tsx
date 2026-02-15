'use client';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { getErrorMessage } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';
import { sendAnonymousMessageAPI, startChatAPI } from '@web/features/chat/api/chat.api';
import { ChatHeader } from '@web/features/chat/components/chat-header';
import { ChatInput } from '@web/features/chat/components/chat-input';
import { IncognitoBar } from '@web/features/chat/components/incognito-bar';
import { type Message, MessageList } from '@web/features/chat/components/message-list';
import { Sidebar } from '@web/features/chat/components/sidebar';
import { useChatStore } from '@web/features/chat/stores';
import { getAnonymousUserId } from '@web/features/chat/utils/anonymous-user';
import clsx from 'clsx';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import styles from './chat.module.scss';

export default function ChatPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const { locale } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { isIncognito, setPendingMessages, setCurrentChatId } = useChatStore();
  const isAnonymous = isIncognito || !hydrated || !isLoggedIn;

  // Track component mount state and trigger fade-in
  useEffect(() => {
    setIsMounted(true);
    // Delay to allow hydration to complete before showing content
    const timer = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => {
      setIsMounted(false);
      cancelAnimationFrame(timer);
    };
  }, []);

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

  const welcomeText = useMemo(
    () => (isIncognito ? t('welcome.incognito') : t('welcome.normal')),
    [isIncognito, t],
  );

  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: Message = {
        id: 'welcome-1',
        role: 'assistant',
        content: welcomeText,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    } else {
      // Update welcome message when incognito mode or hydration state changes
      setMessages((prev) => {
        if (prev.length === 1 && prev[0].id === 'welcome-1') {
          return [
            {
              ...prev[0],
              content: welcomeText,
            },
          ];
        }
        return prev;
      });
    }
  }, [isInitialized, welcomeText, hydrated]);

  // cleanup object URLs(for memory leak prevention)
  useEffect(() => {
    return () => {
      messages.forEach((message) => {
        message.attachments?.forEach((attachment) => {
          if (attachment.url.startsWith('blob:')) {
            URL.revokeObjectURL(attachment.url);
          }
        });
      });
    };
  }, [messages]);

  const handleSend = async (
    message: string,
    options: { webSearch: boolean; file: File | null },
  ) => {
    // TODO: Implement webSearch and file attachment
    void options;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (isAnonymous) {
        const anonymousId = getAnonymousUserId();
        const res = await sendAnonymousMessageAPI(anonymousId, message);
        if (!isMounted) return;
        if (!res.success || !res.data) throw new Error(res.message ?? '요청에 실패했습니다.');
        setCurrentChatId(anonymousId);
        setPendingMessages({ question: message, answer: res.data.answer, timestamp: new Date() });
        router.push(`/${locale}/chat/${anonymousId}`);
      } else {
        const res = await startChatAPI(message);
        if (!isMounted) return;
        if (!res.success || !res.data) throw new Error(res.message ?? '요청에 실패했습니다.');
        const timestamp = new Date();
        setCurrentChatId(res.data.chatRoomId);
        setPendingMessages({ question: message, answer: res.data.answer, timestamp });
        router.push(`/${locale}/chat/${res.data.chatRoomId}`);
      }
    } catch (error) {
      if (!isMounted) return;

      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className={clsx(styles.container, { [styles.ready]: isReady })}>
      <Sidebar />
      <div className={styles.top}>
        <ChatHeader />
        <IncognitoBar />
      </div>

      <div
        className={clsx(styles.chatContainer, {
          [styles.incognito]: isIncognito,
        })}
      >
        <MessageList messages={messages} isLoading={isLoading} locale={locale as SupportedLocale} />
      </div>
      <div className={styles.bottom}>
        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
