'use client';

import { useRef, useEffect } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { formatDate } from '@web/lib/utils/date';
import { SupportedLocale } from '@repo/shared/types';
import { useChatStore } from '@web/features/chat/stores';
import type { MessageRole } from '@web/features/chat/types';
import styles from './message-list.module.scss';

export interface Attachment {
  type: 'image' | 'file';
  url: string;
  name: string;
  size?: number;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
}

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  locale: SupportedLocale;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function MessageList({ messages, isLoading = false, locale }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isIncognito } = useChatStore();

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'nearest' });
    }
  };

  // scroll to bottom when new message arrive
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom('smooth');
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  return (
    <div ref={containerRef} className={styles.messages}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={clsx(styles.messageWrapper, { [styles.user]: message.role === 'user' })}
        >
          <div
            className={clsx(styles.messageContainer, { [styles.user]: message.role === 'user' })}
          >
            {message.role === 'assistant' && (
              <div
                className={clsx(styles.avatar, {
                  [styles.assistant]: message.role === 'assistant',
                })}
              >
                <Image src="/images/luna.png" alt="LUNA" width={32} height={32} />
              </div>
            )}

            <div className={styles.messageBody}>
              {/* name, timestamp */}
              <div className={styles.header}>
                <span
                  className={clsx(styles.sender, {
                    [styles.incognito]: isIncognito,
                  })}
                >
                  {message.role === 'user' ? 'You' : 'LUNA'}
                </span>
                <span
                  className={clsx(styles.timestamp, {
                    [styles.incognito]: isIncognito,
                  })}
                >
                  {formatDate(message.timestamp, 'time', locale)}
                </span>
              </div>

              {/* file attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div
                  className={clsx(styles.attachments, { [styles.user]: message.role === 'user' })}
                >
                  {message.attachments.map((attachment, index) => (
                    <div key={index} className={styles.attachmentCard}>
                      <InsertDriveFileIcon className={styles.fileIcon} />
                      <div className={styles.fileInfo}>
                        <span className={styles.fileName}>{attachment.name}</span>
                        {attachment.size && (
                          <span className={styles.fileSize}>{formatFileSize(attachment.size)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className={clsx(styles.bubble, { [styles.user]: message.role === 'user' })}>
                <p className={styles.messageContent}>{message.content}</p>
              </div>
            </div>
          </div>
        </div>
      ))}

      {isLoading && (
        <div className={styles.messageWrapper}>
          <div className={styles.messageContainer}>
            <div className={styles.avatar}>
              <Image src="/images/luna.png" alt="LUNA" width={32} height={32} />
            </div>

            <div className={styles.messageBody}>
              <div className={styles.header}>
                <span
                  className={clsx(styles.sender, {
                    [styles.incognito]: isIncognito,
                  })}
                >
                  LUNA
                </span>
              </div>
              <div className={clsx(styles.bubble, styles.loadingBubble)}>
                <div className={styles.loadingDots}>
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
