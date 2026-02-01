export type MessageRole = 'user' | 'assistant';

export type AttachmentType = 'image' | 'file';

export interface Attachment {
  type: AttachmentType;
  url: string;
  name: string;
}

export interface ChatRoomItem {
  chatRoomId: string;
  title: string;
}

export interface ChatRoom {
  chatRoomId: string;
  createdAt: string;
  title: string;
  chats: ChatMessage[];
  privateChat: boolean;
}

// single chat message(question-answer pair)
export interface ChatMessage {
  chatId: string;
  createdAt: string;
  question: string;
  answer: string;
  image: string | null;
}

// =========================
// Store Types
// =========================

/**
 * Pending message for initial chat room navigation
 * 초기 채팅방 이동 시 전달할 메시지 데이터
 */
export interface PendingMessage {
  question: string;
  answer: string;
  timestamp: Date;
}

/**
 * chat store state interface
 */
export interface ChatState {
  /** current active chat room ID */
  currentChatId: string | null;
  /** whether incognito mode is enabled */
  isIncognito: boolean;
  /** whether sidebar is open */
  isSidebarOpen: boolean;
  /** whether web search is enabled for messages */
  isWebSearchEnabled: boolean;
  /** whether alert dialog is open */
  isAlertOpen: boolean;
  /** pending messages for initial chat room navigation */
  pendingMessages: PendingMessage | null;
  /** whether store has been hydrated from localStorage */
  isHydrated: boolean;
}

/**
 * chat store actions interface
 */
export interface ChatActions {
  setCurrentChatId: (id: string | null) => void;
  toggleIncognito: () => void;
  toggleSidebar: () => void;
  toggleWebSearch: () => void;
  setAlertOpen: (open: boolean) => void;
  setPendingMessages: (messages: PendingMessage | null) => void;
  clearPendingMessages: () => void;
  reset: () => void;
  setHydrated: (hydrated: boolean) => void;
}

/** complete chat store interface */
export type ChatStore = ChatState & ChatActions;

// =========================
// Component Props Types
// =========================

export type WelcomeMessageType = 'first-time' | 'returning' | 'incognito';

export interface MessageDisplayProps {
  content: string;
  timestamp?: string;
  attachments?: Attachment[];
}

// =========================
// Request Types
// =========================

export type StartChatRequest = {
  question: string;
};
