import { http, HttpResponse } from 'msw';
import type { ApiResponse } from '@repo/shared/types';
import {
  createMockAnonymousMessageResponse,
  createMockSendMessageResponse,
  createMockStartChatResponse,
  createMockUpdateTitleResponse,
  getMockChatMessagesResponse,
  getMockChatRoomsResponse,
} from '@web/features/chat/data';

const baseUrl = '/api';

/**
 * Simulate network delay (300-900ms)
 * 네트워크 지연 시뮬레이션 (300-900ms)
 */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getRandomDelay = () => Math.floor(Math.random() * 600) + 300;

const badRequest = (message: string): HttpResponse => {
  const body: ApiResponse<never> = {
    success: false,
    message,
    code: 400,
    error: { code: 'VALIDATION_ERROR', message },
  };
  return HttpResponse.json(body, { status: 400 });
};

/**
 * MSW handlers for chat endpoints
 * 채팅 API 목업 핸들러
 */
export const chatHandlers = [
  // GET /chats - chat room list
  http.get(`${baseUrl}/chats`, async () => {
    await delay(getRandomDelay());
    return HttpResponse.json(getMockChatRoomsResponse());
  }),

  // POST /chats - start chat
  http.post(`${baseUrl}/chats`, async ({ request }) => {
    await delay(getRandomDelay());

    const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) return badRequest('question은 필수입니다.');

    return HttpResponse.json(createMockStartChatResponse(question));
  }),

  // GET /chats/:chatRoomId - restore messages
  http.get(`${baseUrl}/chats/:chatRoomId`, async ({ params }) => {
    await delay(getRandomDelay());

    const chatRoomId = String(params.chatRoomId ?? '').trim();
    if (!chatRoomId) return badRequest('chatRoomId가 올바르지 않습니다.');

    const response = getMockChatMessagesResponse(chatRoomId);
    const status = response.success ? 200 : 404;
    return HttpResponse.json(response, { status });
  }),

  // POST /chats/:chatRoomId - send message
  http.post(`${baseUrl}/chats/:chatRoomId`, async ({ params, request }) => {
    await delay(getRandomDelay());

    const chatRoomId = String(params.chatRoomId ?? '').trim();
    if (!chatRoomId) return badRequest('chatRoomId가 올바르지 않습니다.');

    const body = (await request.json().catch(() => null)) as { question?: unknown } | null;
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) return badRequest('question은 필수입니다.');

    const response = createMockSendMessageResponse(chatRoomId, question);
    const status = response.success ? 200 : 404;
    return HttpResponse.json(response, { status });
  }),

  // POST /chats/:chatRoomId/title - update title
  http.post(`${baseUrl}/chats/:chatRoomId/title`, async ({ params, request }) => {
    await delay(getRandomDelay());

    const chatRoomId = String(params.chatRoomId ?? '').trim();
    if (!chatRoomId) return badRequest('chatRoomId가 올바르지 않습니다.');

    const body = (await request.json().catch(() => null)) as { title?: unknown } | null;
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    if (!title) return badRequest('title은 필수입니다.');

    const response = createMockUpdateTitleResponse(chatRoomId, title);
    const status = response.success ? 200 : 404;
    return HttpResponse.json(response, { status });
  }),

  // POST /chats/anonymous - anonymous chat
  http.post(`${baseUrl}/chats/anonymous`, async ({ request }) => {
    await delay(getRandomDelay());

    const body = (await request.json().catch(() => null)) as { userId?: unknown; question?: unknown } | null;
    const userId = typeof body?.userId === 'string' ? body.userId.trim() : '';
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!userId) return badRequest('userId는 필수입니다.');
    if (!question) return badRequest('question은 필수입니다.');

    return HttpResponse.json(createMockAnonymousMessageResponse(question));
  }),
];


