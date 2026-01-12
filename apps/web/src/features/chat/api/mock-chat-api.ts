import type { ChatMessage } from '../types';
import { mockAiResponses, mockChatRooms } from '../data/mock-messages';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Simulated delay for realistic API behavior
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Generate a random mock response from predefined templates
 */
const getRandomResponse = (): string => {
  return mockAiResponses[Math.floor(Math.random() * mockAiResponses.length)];
};

/**
 * Generate a mock chatRoomId
 */
const generateChatRoomId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Mock API: Start a new chat
 * POST /chats
 */
export const mockStartChat = async (
  question: string,
): Promise<{ chatRoomId: string; answer: string }> => {
  // TODO: Use question parameter for more realistic responses
  void question;
  // Simulate network delay (2-4 seconds)
  await delay(2000 + Math.random() * 2000);

  return {
    chatRoomId: generateChatRoomId(),
    answer: getRandomResponse(),
  };
};

/**
 * Mock API: Send a message to existing chat room
 * POST /chats/[chatRoom]
 */
export const mockSendMessage = async (
  chatRoomId: string,
  question: string,
): Promise<{ answer: string }> => {
  // TODO: Use chatRoomId and question for more realistic responses
  void chatRoomId;
  void question;

  // Simulate network delay (2-4 seconds)
  await delay(2000 + Math.random() * 2000);

  return {
    answer: getRandomResponse(),
  };
};

/**
 * Mock API: Get chat room messages
 * GET /chats/[chatRoom]
 */
export const mockGetChatMessages = async (chatRoomId: string): Promise<ChatMessage[]> => {
  // TODO: Use chatRoomId to fetch specific chat room messages
  void chatRoomId;

  // Simulate network delay
  await delay(500);

  // Return empty array for new chat rooms
  return [];
};

/**
 * Mock API: Get all chat rooms
 * GET /chats
 */
export const mockGetChatRooms = async (): Promise<Array<{ chatRoomId: string; title: string }>> => {
  // Simulate network delay
  await delay(500);

  // Return mock chat rooms (can be toggled to return empty array for first-time users)
  return mockChatRooms;
};
