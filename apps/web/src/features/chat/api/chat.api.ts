import type { ExtendedAxiosRequestConfig } from '@repo/shared/api/base.api';
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
  return api.get<ChatRoomRes>('/chats');
}

/**
 * POST /chats - 채팅 시작
 */
export async function startChatAPI(question: string): Promise<ChatStartRes> {
  return api.post<ChatStartRes, QuestionReq>('/chats', { question });
}

/**
 * GET /chats/{chatRoomId} - 대화 내용 복원
 */
export async function getChatMessagesAPI(chatRoomId: string): Promise<ChatMessagesRes> {
  return api.get<ChatMessagesRes>(`/chats/${chatRoomId}`);
}

/**
 * POST /chats/{chatRoomId} - 채팅 전송
 */
export async function sendMessageAPI(chatRoomId: string, question: string): Promise<MessageRes> {
  return api.post<MessageRes, QuestionReq>(`/chats/${chatRoomId}`, { question });
}

/**
 * POST /chats/{chatRoomId}/title - 채팅방 제목 수정
 */
export async function updateChatTitleAPI(chatRoomId: string, title: string): Promise<void> {
  return api.post<void, UpdateTitleReq>(`/chats/${chatRoomId}/title`, { title });
}

/**
 * POST /chats/anonymous - 익명 채팅
 */
export async function sendAnonymousMessageAPI(
  anonymousId: string,
  question: string,
): Promise<MessageRes> {
  const config: ExtendedAxiosRequestConfig = {
    skipAuth: true, // 익명 채팅은 Authorization 헤더가 없어야 함
  };
  return api.post<MessageRes, AnonymousReq>(`/chats/anonymous`, { anonymousId, question }, config);
}
