export type MessageRole = 'user' | 'assistant';

export type AttachmentType = 'image' | 'file';

export interface Attachment {
  type: AttachmentType;
  url: string;
  name: string;
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
}

/**
 * chat store actions interface
 */
export interface ChatActions {
  setCurrentChatId: (id: string | null) => void;
  toggleIncognito: () => void;
  toggleSidebar: () => void;
  toggleWebSearch: () => void;
  reset: () => void;
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
