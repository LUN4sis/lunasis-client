import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChatRoomsAPI,
  getChatMessagesAPI,
  startChatAPI,
  sendMessageAPI,
  sendAnonymousMessageAPI,
} from '../api/chat.api';
import { mockGetChatRooms } from '../api/mock-chat-api';

// ============================================================================
// Query Keys
// ============================================================================

export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  room: (chatRoomId: string) => [...chatKeys.all, 'room', chatRoomId] as const,
  messages: (chatRoomId: string) => [...chatKeys.room(chatRoomId), 'messages'] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Get chat rooms list
 * Uses mock API directly for development
 * 개발용 mock API 직접 사용
 */
export const useChatRoomsQuery = () => {
  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: async () => {
      // Use mock API directly until MSW is properly configured
      // MSW가 제대로 설정될 때까지 mock API 직접 사용
      const rooms = await mockGetChatRooms();
      return { data: rooms };
    },
  });
};

/**
 * Get messages for a specific chat room
 * Automatically retries on network/server errors
 */
export const useChatMessagesQuery = (chatRoomId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messages(chatRoomId || ''),
    queryFn: () => getChatMessagesAPI(chatRoomId!),
    enabled: !!chatRoomId,
  });
};

// ============================================================================
// Mutations
// ============================================================================

interface CreateChatMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

/**
 * Create a new chat
 * No automatic retry for mutations
 */
export const useCreateChatMutation = (options?: CreateChatMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) => startChatAPI(question),
    onSuccess: (data) => {
      // Invalidate chat rooms list to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Create a new anonymous chat
 * No automatic retry for mutations
 */
export const useCreateAnonymousChatMutation = (options?: CreateChatMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, question }: { userId: string; question: string }) =>
      sendAnonymousMessageAPI(userId, question),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

interface SendMessageMutationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: unknown) => void;
}

/**
 * Send message to existing chat room
 * No automatic retry for mutations
 */
export const useSendMessageMutation = (
  chatRoomId: string,
  options?: SendMessageMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) => sendMessageAPI(chatRoomId, question),
    onSuccess: (data) => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatRoomId) });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * Send message to existing anonymous chat room
 * No automatic retry for mutations
 */
export const useSendAnonymousMessageMutation = (
  userId: string,
  options?: SendMessageMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) => sendAnonymousMessageAPI(userId, question),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};
