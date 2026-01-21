import {
  createMockSendMessageResponse,
  createMockStartChatResponse,
  getMockChatRoomsResponse,
} from '../data';

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Simulated delay for realistic API behavior
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
  // Simulate network delay (2-4 seconds)
  await delay(2000 + Math.random() * 2000);

  const response = createMockStartChatResponse(question);
  if (!response.success || !response.data) {
    throw new Error(response.message || '채팅 시작에 실패했습니다.');
  }

  return { chatRoomId: response.data.chatRoomId, answer: response.data.answer };
};

/**
 * Mock API: Start a new anonymous chat
 * POST /anonymous
 */
export const mockStartAnonymousChat = async (
  anonymousUserId: string,
  question: string,
): Promise<{ chatRoomId: string; answer: string }> => {
  // 익명 유저는 현재 목업 DB에 저장하지 않아요. / Anonymous user is not persisted in mock DB.
  void anonymousUserId;

  // Simulate network delay (2-4 seconds)
  await delay(2000 + Math.random() * 2000);

  return {
    chatRoomId: generateChatRoomId(),
    answer: createMockStartChatResponse(question).data?.answer ?? '응답 생성에 실패했습니다.',
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
  // Simulate network delay (2-4 seconds)
  await delay(2000 + Math.random() * 2000);

  const response = createMockSendMessageResponse(chatRoomId, question);
  if (!response.success || !response.data) {
    throw new Error(response.message || '메시지 전송에 실패했습니다.');
  }

  return { answer: response.data.answer };
};

/**
 * Mock API: Send a message to existing anonymous chat room
 * POST /anonymous/[chatRoom]
 */
export const mockSendAnonymousMessage = async (
  anonymousUserId: string,
  chatRoomId: string,
  question: string,
): Promise<{ answer: string }> => {
  // 익명 채팅은 현재 목업 DB에 저장하지 않아요. / Anonymous chat is not persisted in mock DB.
  void anonymousUserId;
  void chatRoomId;

  // Simulate network delay (2-4 seconds)
  await delay(2000 + Math.random() * 2000);

  return {
    answer: createMockStartChatResponse(question).data?.answer ?? '응답 생성에 실패했습니다.',
  };
};

/**
 * Mock API: Get chat room messages
 * GET /chats/[chatRoom]
 */
export const mockGetChatMessages = async (chatRoomId: string): Promise<[]> => {
  // 현재 UI에서 사용하지 않아서 비워둡니다. / Not used in current UI.
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

  const response = getMockChatRoomsResponse();
  return response.data ?? [];
};
