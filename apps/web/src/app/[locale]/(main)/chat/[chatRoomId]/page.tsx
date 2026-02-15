'use client';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { getErrorMessage } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';
import { sendAnonymousMessageAPI, sendMessageAPI } from '@web/features/chat/api/chat.api';
import { ChatHeader } from '@web/features/chat/components/chat-header';
import { ChatInput } from '@web/features/chat/components/chat-input';
import { IncognitoBar } from '@web/features/chat/components/incognito-bar';
import { type Message, MessageList } from '@web/features/chat/components/message-list';
import { Sidebar } from '@web/features/chat/components/sidebar';
import { useChatStore } from '@web/features/chat/stores';
import clsx from 'clsx';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import styles from '../chat.module.scss';

export default function ChatRoomPage() {
  const t = useTranslations('chat');
  const { locale, chatRoomId } = useParams<{ locale: string; chatRoomId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isMounted, setIsMounted] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { isIncognito, pendingMessages, clearPendingMessages, setCurrentChatId } = useChatStore();
  // Only use isLoggedIn after hydration to prevent false negatives
  const isAnonymous = isIncognito || (!hydrated || !isLoggedIn);

  // currentChatId를 URL params와 동기화 (익명: chatRoomId=anonymousId, 로그인: chatRoomId=서버 ID)
  useEffect(() => {
    if (chatRoomId) setCurrentChatId(chatRoomId);
  }, [chatRoomId, setCurrentChatId]);

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
  // 하단 네비게이션 숨기기
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

  // Initialize messages from pendingMessages or welcome message
  // pendingMessages가 있으면 초기 메시지로 설정, 없으면 웰컴 메시지 표시
  useEffect(() => {
    if (isInitialized) {
      return;
    }

    const initialMessages: Message[] = [];

    // Add welcome message
    // 웰컴 메시지 추가
    initialMessages.push({
      id: 'welcome-1',
      role: 'assistant',
      content: welcomeText,
      timestamp: new Date(),
    });

    // If we have pending messages from the initial chat, add them
    // 초기 채팅에서 전달받은 메시지가 있으면 추가
    if (pendingMessages) {
      // Add user's question
      // 사용자 질문 추가
      initialMessages.push({
        id: `user-initial`,
        role: 'user',
        content: pendingMessages.question,
        timestamp: pendingMessages.timestamp,
      });

      // Add AI's answer
      // AI 응답 추가
      initialMessages.push({
        id: `ai-initial`,
        role: 'assistant',
        content: pendingMessages.answer,
        timestamp: pendingMessages.timestamp,
      });

      // Clear pending messages after use
      // 사용 후 pending 메시지 초기화
      clearPendingMessages();
    }

    setMessages(initialMessages);
    setIsInitialized(true);
  }, [isInitialized, welcomeText, pendingMessages, clearPendingMessages]);

  // cleanup object URLs (for memory leak prevention)
  // 메모리 누수 방지를 위한 object URL 정리
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
    // TODO: Implement webSearch
    const attachments = options.file
      ? [
          {
            type: 'file' as const,
            url: URL.createObjectURL(options.file),
            name: options.file.name,
            size: options.file.size,
          },
        ]
      : undefined;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      attachments,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const res = isAnonymous
        ? await sendAnonymousMessageAPI(chatRoomId, message)
        : await sendMessageAPI(chatRoomId, message);

      if (!isMounted) return;
      if (!res.success || !res.data) throw new Error(res.message ?? '요청에 실패했습니다.');

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: res.data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      // Only show error if component is still mounted
      if (!isMounted) return;

      // Use standardized error handling
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      // Only update loading state if component is still mounted
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
