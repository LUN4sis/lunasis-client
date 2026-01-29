import type { ChatRoom, ChatStart } from '@web/features/chat/types/api.type';
import { http, HttpResponse } from 'msw';

import { findMockAnswerForQuestion, mockChatRooms, mockChatRoomsById } from '../data/chat.data';

const baseUrl = '/api';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getRandomDelay = () => Math.floor(Math.random() * 800) + 600;

/** 채팅 메시지 전송(POST) 시 시뮬레이션 지연 ~7초 */
const CHAT_SEND_DELAY_MS = 7000;

/** POST /chats 시 사용할 새 방 ID 생성 (mock 전용) */
let mockRoomIdCounter = 100;
function generateMockChatRoomId(): string {
  return `mock-chat-${String(mockRoomIdCounter++).padStart(3, '0')}`;
}

/** 질문에서 채팅방 제목 생성 (첫 30자) */
function titleFromQuestion(question: string): string {
  const t = question.trim();
  return t.length > 30 ? t.slice(0, 27) + '...' : t;
}

export const chatHandlers = [
  // GET /api/chats - 채팅방 목록
  http.get(`${baseUrl}/chats`, async () => {
    await delay(getRandomDelay());
    const list: ChatRoom[] = mockChatRooms.map((r) => ({
      chatRoomId: r.chatRoomId,
      title: r.title,
    }));
    return HttpResponse.json({ success: true, data: list });
  }),

  // GET /api/chats/:chatRoomId - 대화 내용
  http.get(`${baseUrl}/chats/:chatRoomId`, async ({ params }) => {
    await delay(getRandomDelay());
    const id = params.chatRoomId as string;
    const room = mockChatRoomsById.get(id);
    if (!room) {
      return HttpResponse.json(
        { success: false, message: 'Chat room not found.' },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: room.chats });
  }),

  // POST /api/chats - 채팅 시작 (새 방 생성 + 첫 답변)
  http.post(`${baseUrl}/chats`, async ({ request }) => {
    await delay(CHAT_SEND_DELAY_MS);
    const body = (await request.json()) as { question?: string };
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return HttpResponse.json(
        { success: false, message: 'A question is required.' },
        { status: 400 },
      );
    }
    const answer = findMockAnswerForQuestion(question);
    const chatRoomId = generateMockChatRoomId();
    const title = titleFromQuestion(question);
    const res: ChatStart = { chatRoomId, title, answer };
    return HttpResponse.json({ success: true, data: res });
  }),

  // POST /api/chats/anonymous - 익명 채팅 (:chatRoomId 보다 먼저 선언해야 'anonymous'가 path param으로 잡히지 않음)
  http.post(`${baseUrl}/chats/anonymous`, async ({ request }) => {
    await delay(CHAT_SEND_DELAY_MS);
    const body = (await request.json()) as { anonymousId?: string; question?: string };
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return HttpResponse.json(
        { success: false, message: 'A question is required.' },
        { status: 400 },
      );
    }
    const answer = findMockAnswerForQuestion(question);
    return HttpResponse.json({ success: true, data: { answer } });
  }),

  // POST /api/chats/:chatRoomId - continue conversation
  http.post(`${baseUrl}/chats/:chatRoomId`, async ({ params, request }) => {
    await delay(CHAT_SEND_DELAY_MS);
    const id = params.chatRoomId as string;
    const body = (await request.json()) as { question?: string };
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    if (!question) {
      return HttpResponse.json(
        { success: false, message: 'A question is required.' },
        { status: 400 },
      );
    }
    const room = mockChatRoomsById.get(id);
    const prefix = 12; // match prefix for English phrases
    const answer = room
      ? (room.chats.find(
          (c) =>
            c.question.toLowerCase().includes(question.slice(0, prefix).toLowerCase()) ||
            question.toLowerCase().includes(c.question.slice(0, prefix).toLowerCase()),
        )?.answer ?? findMockAnswerForQuestion(question))
      : findMockAnswerForQuestion(question);
    return HttpResponse.json({ success: true, data: { answer } });
  }),

  // POST /api/chats/:chatRoomId/title - 제목 수정
  http.post(`${baseUrl}/chats/:chatRoomId/title`, async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as { title?: string };
    const _title = typeof body?.title === 'string' ? body.title : '';
    void params;
    void _title;
    return HttpResponse.json({ success: true });
  }),
];
