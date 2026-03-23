'use client';

import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStore, useAuthStoreHydration } from '@repo/shared/features/auth';
import { SupportedLocale } from '@repo/shared/types';
import { getErrorMessage } from '@repo/shared/utils';
import { toast } from '@web/components/ui/toast';
import { MessageList, type Message } from '@web/features/chat/components/message-list';
import { useChatLayout } from '@web/features/chat/contexts';
import { useCreateAnonymousChatMutation, useCreateChatMutation } from '@web/features/chat/hooks';
import { useChatStore } from '@web/features/chat/stores';
import { getAnonymousUserId } from '@web/features/chat/utils';

import styles from './chat.module.scss';

export default function ChatPage() {
  const t = useTranslations('chat');
  const router = useRouter();
  const { locale } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setLayoutActions } = useChatLayout();
  const [isInitialized, setIsInitialized] = useState(false);
  const isMountedRef = useRef(true);
  const hydrated = useAuthStoreHydration();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { isIncognito, setCurrentChatId, setPendingMessages } = useChatStore();
  const isAnonymous = isIncognito || !hydrated || !isLoggedIn;

  // React Query mutations
  const createChatMutation = useCreateChatMutation({
    onSuccess: (data, question) => {
      if (!isMountedRef.current) return;
      const timestamp = new Date();
      setCurrentChatId(data.chatRoomId);
      setPendingMessages({ question, answer: data.answer, timestamp });
      setIsLoading(false);
      router.push(`/${locale}/chat/${data.chatRoomId}`);
    },
    onError: (error) => {
      if (!isMountedRef.current) return;
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setIsLoading(false);
    },
  });

  const createAnonymousChatMutation = useCreateAnonymousChatMutation({
    onSuccess: (data, question) => {
      if (!isMountedRef.current) return;
      const anonymousId = getAnonymousUserId();
      setCurrentChatId(anonymousId);
      setPendingMessages({ question, answer: data.answer, timestamp: new Date() });
      setIsLoading(false);
      router.push(`/${locale}/chat/${anonymousId}`);
    },
    onError: (error) => {
      if (!isMountedRef.current) return;
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      setIsLoading(false);
    },
  });

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
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

  const handleSend = useCallback(
    async (
      message: string,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      _options: { webSearch: boolean; file: File | null },
    ) => {
      // TODO: Implement webSearch and file attachment

      // Validate input
      const trimmed = message.trim();
      if (!trimmed) {
        toast.error(t('validation.emptyMessage'));
        return;
      }
      if (trimmed.length > 5000) {
        toast.error(t('validation.messageTooLong'));
        return;
      }

      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      if (isAnonymous) {
        createAnonymousChatMutation.mutate(trimmed);
      } else {
        createChatMutation.mutate(trimmed);
      }
    },
    [isAnonymous, createAnonymousChatMutation, createChatMutation, t],
  );

  // Register handleSend and isLoading with the layout
  useEffect(() => {
    setLayoutActions({ handleSend, isLoading });
  }, [handleSend, isLoading, setLayoutActions]);

  return (
    <div className={styles.messageListWrapper}>
      <MessageList messages={messages} isLoading={isLoading} locale={locale as SupportedLocale} />
    </div>
  );
}
