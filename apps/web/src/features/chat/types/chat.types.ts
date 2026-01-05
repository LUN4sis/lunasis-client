/**
 * Chat feature type definitions
 */

// ============================================================================
// Core Entity Types
// ============================================================================

/**
 * Message role in a conversation
 */
export type MessageRole = 'user' | 'assistant';

/**
 * Attachment type for messages
 */
export type AttachmentType = 'image' | 'file';

/**
 * Attachment interface for message attachments
 */
export interface Attachment {
  type: AttachmentType;
  url: string;
  name: string;
}

/**
 * Chat room item in the list
 */
export interface ChatRoom {
  chatRoomId: string;
  title: string;
}

/**
 * Single chat message (question-answer pair)
 */
export interface ChatMessage {
  chatId: string;
  question: string;
  answer: string;
  image: string | null;
}

// ============================================================================
// API Request Types
// ============================================================================

/**
 * Request body for creating a new chat
 */
export interface CreateChatRequest {
  question: string;
}

/**
 * Request body for sending a message in an existing chat room
 */
export interface SendMessageRequest {
  question: string;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Response data for GET /chats - chat room list
 */
export interface GetChatsResponseData {
  chatRoomId: string;
  title: string;
}

/**
 * Response data for POST /chats - create new chat
 */
export interface CreateChatResponseData {
  chatRoomId: string;
  answer: string;
}

/**
 * Response data for GET /chats/[chatRoom] - chat room messages
 */
export interface GetChatMessagesResponseData {
  chatId: string;
  question: string;
  answer: string;
  image: string | null;
}

/**
 * Response data for POST /chats/[chatRoom] - send message
 */
export interface SendMessageResponseData {
  answer: string;
}

// ============================================================================
// Store Types
// ============================================================================

/**
 * Chat store state interface
 */
export interface ChatState {
  /** Current active chat room ID */
  currentChatId: string | null;
  /** Whether incognito mode is enabled */
  isIncognito: boolean;
  /** Whether sidebar is open */
  isSidebarOpen: boolean;
  /** Whether web search is enabled for messages */
  isWebSearchEnabled: boolean;
}

/**
 * Chat store actions interface
 */
export interface ChatActions {
  setCurrentChatId: (id: string | null) => void;
  toggleIncognito: () => void;
  toggleSidebar: () => void;
  toggleWebSearch: () => void;
  reset: () => void;
}

/**
 * Complete chat store interface
 */
export type ChatStore = ChatState & ChatActions;

// ============================================================================
// Component Props Types
// ============================================================================

/**
 * Welcome message type variants
 */
export type WelcomeMessageType = 'first-time' | 'returning' | 'incognito';

/**
 * Props for message display components
 */
export interface MessageDisplayProps {
  content: string;
  timestamp?: string;
  attachments?: Attachment[];
}
