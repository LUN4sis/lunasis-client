import { handleApiError } from '@repo/shared/utils';

import { api } from '@web/api/api';

import type {
  AnonymousReq,
  ChatMessagesRes,
  ChatRoomRes,
  ChatStartRes,
  MessageRes,
  QuestionReq,
  UpdateTitleReq,
} from '../types/api.type';

/**
 * GET /chats - 채팅방 목록
 */
export async function getChatRoomsAPI(): Promise<ChatRoomRes> {
  try {
    return await api.get<ChatRoomRes>('/chats');
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * POST /chats - 채팅 시작
 */
export async function startChatAPI(question: string): Promise<ChatStartRes> {
  try {
    return await api.post<ChatStartRes, QuestionReq>('/chats', { question });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * GET /chats/{chatRoomId} - 대화 내용 복원
 */
export async function getChatMessagesAPI(chatRoomId: string): Promise<ChatMessagesRes> {
  try {
    return await api.get<ChatMessagesRes>(`/chats/${chatRoomId}`);
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * POST /chats/{chatRoomId} - 채팅 전송
 */
export async function sendMessageAPI(chatRoomId: string, question: string): Promise<MessageRes> {
  try {
    return await api.post<MessageRes, QuestionReq>(`/chats/${chatRoomId}`, { question });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * POST /chats/{chatRoomId}/title - 채팅방 제목 수정
 */
export async function updateChatTitleAPI(chatRoomId: string, title: string): Promise<void> {
  try {
    return await api.post<void, UpdateTitleReq>(`/chats/${chatRoomId}/title`, { title });
  } catch (error) {
    throw handleApiError(error);
  }
}

/**
 * POST /chats/anonymous - 익명 채팅
 */
export async function sendAnonymousMessageAPI(
  anonymousId: string,
  question: string,
): Promise<MessageRes> {
  // Authorization 헤더를 제거하기 위해 transformRequest 사용
  return api.post<MessageRes, AnonymousReq>(
    `/chats/anonymous`,
    { anonymousId, question },
    {
      transformRequest: [
        (data, headers) => {
          delete headers.Authorization;
          return JSON.stringify(data);
        },
      ],
    },
  );
}
