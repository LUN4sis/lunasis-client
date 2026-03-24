import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  anonymousChatAPI,
  createChatRoomAPI,
  getChatLogAPI,
  getChatRoomsAPI,
  sendMessageAPI,
} from '../api/chat.api';
import type { AnonymousRes, CreateChatRoomRes, SendMessageRes } from '../types/api.type';

export const chatKeys = {
  all: ['chat'] as const,
  rooms: () => [...chatKeys.all, 'rooms'] as const,
  room: (chatRoomId: string) => [...chatKeys.all, 'room', chatRoomId] as const,
  messages: (chatRoomId: string) => [...chatKeys.room(chatRoomId), 'messages'] as const,
};

/**
 * ChatRoom List Query
 *
 * @description
 * - to show list of chat rooms in sidebar
 * - ignore or disable this query in Incognito mode
 *
 * @remarks
 * - automatic retries on network/server errors
 * - invalidate automatically when create new chat room
 *
 * @example
 * const { data: rooms, isLoading, error } = useChatRoomsQuery();
 */

export const useChatRoomsQuery = (enabled = true) => {
  return useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: getChatRoomsAPI,
    enabled,
  });
};

/**
 * Chat Messages Query in a specific chat room
 *
 * @param chatRoomId - the ID of the chat room to fetch messages for (null to disable query)
 *
 * @description
 * - show chat log when sidebar clicked
 * - query disabled(enabled: false) when chatRoomId is null
 *
 * @remarks
 * - automatic retries on network/server errors
 * - automatically invalidates when sending new message
 *
 * @example
 * const { data: messages, isLoading, error } = useChatMessagesQuery(selectedRoomId);
 */

export const useChatMessagesQuery = (chatRoomId: string | null) => {
  return useQuery({
    queryKey: chatKeys.messages(chatRoomId || ''),
    queryFn: () => getChatLogAPI(chatRoomId!),
    enabled: !!chatRoomId,
  });
};

/**
 * ChatRoom Creation Mutation
 */
interface CreateChatMutationOptions {
  /** 채팅방 생성 성공 시 실행될 콜백 (생성된 채팅방 정보, 전송한 질문 포함) */
  onSuccess?: (data: CreateChatRoomRes, question: string) => void;
  /** 에러 발생 시 실행될 콜백 */
  onError?: (error: unknown) => void;
}

/**
 *
 * @param options - 성공/실패 콜백 함수
 *
 * @description
 * - 로그인한 사용자가 처음 질문을 보낼 때 사용
 *
 * @example
 * const createChat = useCreateChatMutation({
 *   onSuccess: (data) => {
 *     router.push(`/chat/${data.chatRoomId}`);
 *   }
 * });
 */
export const useCreateChatMutation = (options?: CreateChatMutationOptions) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) => createChatRoomAPI({ question }),
    onSuccess: (data, question) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      options?.onSuccess?.(data, question);
    },
    onError: options?.onError,
  });
};

/**
 * 익명 채팅 Mutation 옵션
 */
interface AnonymousChatMutationOptions {
  /** 익명 채팅 성공 시 실행될 콜백 (답변, 전송한 질문 포함) */
  onSuccess?: (data: AnonymousRes, question: string) => void;
  /** 에러 발생 시 실행될 콜백 */
  onError?: (error: unknown) => void;
}

/**
 * 익명 채팅 생성 및 전송 훅 (비로그인 사용자)
 *
 * @param options - 성공/실패 콜백 함수
 *
 * @description
 * - 비로그인 사용자 또는 Incognito 모드에서 질문을 보낼 때 사용
 * - 채팅방이 생성되지 않으며, 서버에서 답변만 반환받음
 * - 익명 사용자는 대화 히스토리가 저장되지 않음
 */
export const useCreateAnonymousChatMutation = (options?: AnonymousChatMutationOptions) => {
  return useMutation({
    mutationFn: (question: string) => anonymousChatAPI({ question }),
    onSuccess: (data, question) => {
      // Anonymous users have no chat room list — no invalidation needed
      options?.onSuccess?.(data, question);
    },
    onError: options?.onError,
  });
};

/**
 * 메시지 전송 Mutation 옵션
 */
interface SendMessageMutationOptions {
  /** 메시지 전송 성공 시 실행될 콜백 (업데이트된 전체 메시지 배열 포함) */
  onSuccess?: (data: SendMessageRes) => void;
  /** 에러 발생 시 실행될 콜백 */
  onError?: (error: unknown) => void;
}

/**
 * 기존 채팅방에 메시지 전송 훅
 *
 * @param options - 성공/실패 콜백 함수
 *
 * @description
 * - 이미 생성된 채팅방에서 추가 질문을 보낼 때 사용
 * - 첫 채팅 이후에는 이 API를 사용 (POST /chats/{chatRoomId})
 * - 서버에서 업데이트된 전체 메시지 배열을 반환받음
 */
export const useSendMessageMutation = (
  chatRoomId: string,
  options?: SendMessageMutationOptions,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (question: string) => sendMessageAPI(chatRoomId, { question }),
    onSuccess: (data) => {
      // 해당 채팅방의 메시지 목록을 다시 불러와서 최신 메시지 반영
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(chatRoomId) });
      options?.onSuccess?.(data);
    },
    onError: options?.onError,
  });
};

/**
 * 익명 사용자 추가 메시지 전송 훅
 *
 * @param options - 성공/실패 콜백 함수
 *
 * @description
 * - 익명 사용자가 추가 질문을 보낼 때 사용
 * - `useCreateAnonymousChatMutation`과 동일한 API를 호출
 * - 채팅방이 없으므로 매번 독립적인 질문-답변 쌍으로 처리됨
 */
export const useSendAnonymousMessageMutation = (options?: AnonymousChatMutationOptions) => {
  return useMutation({
    mutationFn: (question: string) => anonymousChatAPI({ question }),
    onSuccess: (data, question) => {
      // Anonymous users have no chat room list — no invalidation needed
      options?.onSuccess?.(data, question);
    },
    onError: options?.onError,
  });
};
