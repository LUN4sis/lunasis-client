'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';

import { ChatHeader } from '@web/features/chat/components/chat-header';
import { ChatInput } from '@web/features/chat/components/chat-input';
import { IncognitoBar } from '@web/features/chat/components/incognito-bar';
import { MessageList, type Message } from '@web/features/chat/components/message-list';

import { SupportedLocale } from '@repo/shared/types';
import { mockStartChat, mockSendMessage } from '@web/features/chat/api/mock-chat-api';
import { useChatStore } from '@web/features/chat/stores';

import clsx from 'clsx';
import styles from './chat.module.scss';

export default function ChatPage() {
  const t = useTranslations('chat');
  const { locale } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatRoomId, setChatRoomId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isIncognito } = useChatStore();

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
    }
  }, [isInitialized, welcomeText]);

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
      let aiResponse: string;

      if (!chatRoomId) {
        const response = await mockStartChat(message);
        setChatRoomId(response.chatRoomId);
        aiResponse = response.answer;
      } else {
        // Send message to existing chat
        const response = await mockSendMessage(chatRoomId, message);
        aiResponse = response.answer;
      }

      // add AI response
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      // TODO: show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
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
