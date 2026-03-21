// =========================
// Message Types
// =========================

export type MessageRole = 'user' | 'assistant';

export type AttachmentType = 'image' | 'file';

export interface Attachment {
  type: AttachmentType;
  url: string;
  name: string;
}

// =========================
// Component Props Types
// =========================

/**
 * 환영 메시지 타입
 * - first-time: 처음 방문한 사용자
 * - returning: 재방문 사용자
 * - incognito: 익명 모드 사용자
 */
export type WelcomeMessageType = 'first-time' | 'returning' | 'incognito';

export interface MessageDisplayProps {
  content: string;
  timestamp?: string;
  attachments?: Attachment[];
}
