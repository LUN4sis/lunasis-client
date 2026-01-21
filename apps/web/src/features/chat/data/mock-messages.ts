import type { ApiResponse } from '@repo/shared/types';
import { mapStatusToErrorCode } from '@repo/shared/types';
import type { Answer, ChatMessage, ChatRoom, ChatStart } from '../types/api.type';

/** success 응답 생성 / Create success response */
const createSuccessResponse = <T>(data: T, message = 'OK'): ApiResponse<T> => {
  return { success: true, message, data };
};

/** error 응답 생성 / Create error response */
const createErrorResponse = (message: string, code: number): ApiResponse<never> => {
  return {
    success: false,
    message,
    code,
    error: { code: mapStatusToErrorCode(code), message },
  };
};

// ============================================================================
// AI Response Templates (Natural)
// ============================================================================

type Intent =
  | 'CLINIC_NEARBY'
  | 'CHECKUP'
  | 'SYMPTOM'
  | 'PERIOD'
  | 'CONTRACEPTION'
  | 'PREGNANCY'
  | 'STI'
  | 'ETC';

const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

const hasAny = (text: string, keywords: string[]) => keywords.some((k) => text.includes(k));

const detectIntent = (q: string): Intent => {
  const s = q.replace(/\s+/g, ' ').trim().toLowerCase();

  if (hasAny(s, ['근처', '주말', '야간', '여성의원', '산부인과', '병원', '의원', '클리닉', '추천'])) {
    return 'CLINIC_NEARBY';
  }
  if (hasAny(s, ['건강검진', '검진', '검사', 'hpv', '자궁경부암', '유방', '초음파', '피검사'])) {
    return 'CHECKUP';
  }
  if (hasAny(s, ['증상', '통증', '가려움', '분비물', '냄새', '따가움', '열', '혈', '출혈', '배가', '복통'])) {
    return 'SYMPTOM';
  }
  if (hasAny(s, ['생리', '월경', '주기', '생리통', '부정출혈', '생리불순'])) {
    return 'PERIOD';
  }
  if (hasAny(s, ['피임', '약', '콘돔', '사후피임약', '미레나', '루프'])) {
    return 'CONTRACEPTION';
  }
  if (hasAny(s, ['임신', '테스트기', '착상', '임신초기', '임신 가능성'])) {
    return 'PREGNANCY';
  }
  if (hasAny(s, ['성병', 'sti', 'std', '질염', '곤지름', '헤르페스', '클라미디아', '임질'])) {
    return 'STI';
  }
  return 'ETC';
};

const needsSafetyNote = (q: string) => {
  const s = q.toLowerCase();
  // 과도하게 남발하지 않기: 응급/중증 신호에만
  return hasAny(s, ['심한', '갑자기', '실신', '호흡', '멈출', '대량출혈', '피가 많이', '고열', '임신인데', '극심한 통증']);
};

const safetyNote = () =>
  pick([
    '지금 증상이 “갑자기 심해짐/대량 출혈/실신/고열” 쪽이면, 대기하지 말고 바로 진료(응급 포함)로 이어가는 게 안전해요.',
    '증상이 빠르게 악화되거나 출혈·통증이 심하면, 온라인 정보로 버티지 말고 즉시 진료를 우선으로 잡는 걸 권장해요.',
  ]);

const askLocation = () =>
  pick([
    '어느 지역(동/구) 기준으로 찾으면 될까요? 그리고 “주말(토/일)” 중 어느 요일이 필요해요?',
    '지역만 알려주면 실제로 갈 만한 곳 위주로 좁혀볼게요. (예: 서울 강남구, 성남 분당 등)',
  ]);

const formatList = (items: string[]) => items.map((x) => `- ${x}`).join('\n');

const respond = (question: string): string => {
  const intent = detectIntent(question);
  const safety = needsSafetyNote(question);

  // 오프닝은 짧게. 매번 “공유해주셔서~” 같은 문장 반복 금지.
  const openings = [
    '좋아요, 정리해서 안내할게요.',
    '지금 질문 기준으로 핵심만 잡아볼게요.',
    '상황을 조금만 더 구체화하면 정확도가 확 올라가요.',
    '가능한 선택지를 빠르게 좁혀볼게요.',
  ];

  const closings = [
    '원하면 답변을 “한 줄 요약 + 체크리스트” 형태로 더 짧게도 바꿔줄게요.',
    '추가로 증상/기간/최근 검사 여부까지 알려주면 더 정확히 좁혀볼 수 있어요.',
    '원하면 “병원 방문 전 체크할 것들”도 같이 정리해줄게요.',
  ];

  const open = pick(openings);
  const close = pick(closings);

  // intent별로 “구체적인 질문 + 안내” 패턴을 섞어서 생성
  switch (intent) {
    case 'CLINIC_NEARBY': {
      const bodyVariants = [
        () =>
          [
            '근처에서 주말 진료하는 여성의원을 찾을 때는 아래 3가지만 먼저 확인하면 실패 확률이 확 줄어요:',
            formatList([
              '접수 마감 시간(“진료 종료”가 아니라 “접수 종료” 기준)',
              '산부인과/여성의원 실제 진료 항목(초음파, 질염 검사, 피임 상담 등)',
              '당일 예약/워크인 가능 여부(주말은 예약 마감이 빠름)',
            ]),
            askLocation(),
          ].join('\n'),
        () =>
          [
            '주말 진료 병원 추천은 “지역 + 원하는 진료(검진/증상/피임 등) + 가능한 시간대”가 있어야 정확해요.',
            askLocation(),
            '추가로 “오늘/이번 주말 중 언제”인지도 알려주면, 야간/주말 키워드로 딱 맞게 좁혀서 안내할게요.',
          ].join('\n'),
      ];

      return [open, pick(bodyVariants)(), safety ? `\n\n${safetyNote()}` : '', `\n\n${close}`]
        .filter(Boolean)
        .join('');
    }

    case 'CHECKUP': {
      const bodyVariants = [
        () =>
          [
            '기본 여성 건강검진은 보통 이렇게 묶어서 생각하면 편해요:',
            formatList([
              '자궁경부암: 세포검사(Pap) ± HPV 검사(연령/가이드에 따라)',
              '유방: 임상진찰 + 필요 시 유방촬영/초음파(나이·위험도에 따라)',
              '기본 혈액/소변 검사: 빈혈, 염증, 간·신장, 당/지질 등(일반검진)',
            ]),
            '만약 “가족력/증상/임신 계획”이 있으면 권장 조합이 달라져요. 나이대와 목적(정기검진 vs 증상 확인)만 알려줘도 더 현실적으로 추천 가능해요.',
          ].join('\n'),
        () =>
          [
            '검진은 “무조건 많이”보다 “목적에 맞게”가 더 좋아요.',
            formatList([
              '정기 체크: 기본검진 + 자궁경부암(주기) 중심',
              '증상 있음: 증상 기반 검사(진찰/초음파/분비물 검사 등) 우선',
              '임신 계획: 풍진·B형간염 항체, 철분/빈혈, 갑상선 등 추가 고려',
            ]),
            '나이/최근 검사 시점/특이 증상(있다면)을 알려주면 추천을 더 날카롭게 조정해줄게요.',
          ].join('\n'),
      ];

      return [open, pick(bodyVariants)(), safety ? `\n\n${safetyNote()}` : '', `\n\n${close}`]
        .filter(Boolean)
        .join('');
    }

    case 'SYMPTOM':
    case 'PERIOD':
    case 'CONTRACEPTION':
    case 'PREGNANCY':
    case 'STI': {
      // 의료 조언 톤은 “판단”보다 “분류+다음 행동” 위주로
      const bodyVariants = [
        () =>
          [
            '지금 질문은 몇 가지 정보만 더 있으면 답이 훨씬 정확해져요.',
            formatList([
              '증상 시작 시점(언제부터) / 강도(가벼움-중간-심함)',
              '동반 증상: 발열, 냄새/색 변화, 출혈, 통증 위치',
              '최근 변화: 성관계, 피임 변화, 스트레스/수면, 약 복용',
            ]),
            '가능하면 위 3줄만 채워서 다시 보내줘요. 그럼 “집에서 지켜볼지 vs 병원 가야 할지” 기준으로 정리해줄게요.',
          ].join('\n'),
        () =>
          [
            '정확한 진단 대신, 우선 “가능성의 우선순위”와 “다음 액션”으로 정리해볼게요.',
            formatList([
              '갑자기 심해짐/출혈·통증이 크면 → 진료 우선',
              '경미하지만 지속(수일 이상) → 검사로 원인 확인이 이득',
              '반복되는 패턴(매달/주기성) → 기록(주기/증상) 기반으로 접근',
            ]),
            '지금은 질문 문장만으로는 정보가 부족해서, 위 체크 포인트 중 2~3개만 알려주면 현실적인 가이드를 줄 수 있어요.',
          ].join('\n'),
      ];

      return [open, pick(bodyVariants)(), safety ? `\n\n${safetyNote()}` : '', `\n\n${close}`]
        .filter(Boolean)
        .join('');
    }

    default: {
      const bodyVariants = [
        () =>
          [
            '요지를 한 번만 더 좁혀보자.',
            formatList([
              '무엇을 알고 싶은지(정보/추천/해석/다음 행동)',
              '기간/빈도(언제부터, 얼마나 자주)',
              '가능한 제약(지역, 시간, 예산 등)',
            ]),
            '위에서 1~2개만 추가해주면, 그에 맞춰 답을 더 구체적으로 만들 수 있어.',
          ].join('\n'),
        () =>
          [
            '지금 질문은 범위가 넓어서, 먼저 선택지를 좁히는 게 좋아요.',
            '원하는 결과가 “딱 하나의 결론”인지, 아니면 “가능한 선택지 비교”인지 알려줘요. 그에 맞춰 답변 포맷을 맞출게요.',
          ].join('\n'),
      ];

      return [open, pick(bodyVariants)(), safety ? `\n\n${safetyNote()}` : '', `\n\n${close}`]
        .filter(Boolean)
        .join('');
    }
  }
};

const createId = (prefix: string): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
};

const createTitleFromQuestion = (question: string): string => {
  const trimmed = question.trim();
  if (!trimmed) return '새 채팅';
  return trimmed.length > 30 ? `${trimmed.slice(0, 30)}...` : trimmed;
};

// ============================================================================
// In-memory store
// ============================================================================

type ChatRoomState = {
  room: ChatRoom;
  messages: ChatMessage[];
};

const rooms = new Map<string, ChatRoomState>();
const roomOrder: string[] = [];

/**
 * 초기 seed 데이터 / Seed initial data
 */
const seed = () => {
  if (roomOrder.length > 0) return;

  const room1Id = 'chat-001';
  const room1Title = '여성 건강 클리닉 문의';
  rooms.set(room1Id, {
    room: { chatRoomId: room1Id, title: room1Title },
    messages: [
      {
        chatId: 'chat-001-001',
        question: '주말에도 진료하는 근처 여성의원 알려줘.',
        answer: [
          '좋아요, 정리해서 안내할게요.',
          '근처에서 주말 진료하는 여성의원을 찾을 때는 아래 3가지만 먼저 확인하면 실패 확률이 확 줄어요:',
          '- 접수 마감 시간(“진료 종료”가 아니라 “접수 종료” 기준)',
          '- 산부인과/여성의원 실제 진료 항목(초음파, 질염 검사, 피임 상담 등)',
          '- 당일 예약/워크인 가능 여부(주말은 예약 마감이 빠름)',
          '어느 지역(동/구) 기준으로 찾으면 될까요? 그리고 “주말(토/일)” 중 어느 요일이 필요해요?',
        ].join('\n'),
        image: null,
      },
    ],
  });
  roomOrder.push(room1Id);

  const room2Id = 'chat-002';
  const room2Title = '웰니스 체크업';
  rooms.set(room2Id, {
    room: { chatRoomId: room2Id, title: room2Title },
    messages: [
      {
        chatId: 'chat-002-001',
        question: '여성 건강검진은 어떤 항목이 기본이야?',
        answer: [
          '지금 질문 기준으로 핵심만 잡아볼게요.',
          '기본 여성 건강검진은 보통 이렇게 묶어서 생각하면 편해요:',
          '- 자궁경부암: 세포검사(Pap) ± HPV 검사(연령/가이드에 따라)',
          '- 유방: 임상진찰 + 필요 시 유방촬영/초음파(나이·위험도에 따라)',
          '- 기본 혈액/소변 검사: 빈혈, 염증, 간·신장, 당/지질 등(일반검진)',
          '나이대와 목적(정기검진 vs 증상 확인)만 알려주면 추천 조합을 더 현실적으로 조정해줄게요.',
        ].join('\n'),
        image: null,
      },
    ],
  });
  roomOrder.push(room2Id);
};

seed();

// ============================================================================
// Public: Query helpers (used by MSW/mock api)
// ============================================================================

/** 채팅방 목록 응답 / Get chat rooms response */
export const getMockChatRoomsResponse = (): ApiResponse<ChatRoom[]> => {
  const list = roomOrder
    .map((id) => rooms.get(id)?.room)
    .filter((v): v is ChatRoom => !!v);
  return createSuccessResponse(list);
};

/** 특정 채팅방 메시지 목록 응답 / Get messages by chatRoomId response */
export const getMockChatMessagesResponse = (chatRoomId: string): ApiResponse<ChatMessage[]> => {
  const state = rooms.get(chatRoomId);
  if (!state) return createErrorResponse('채팅방을 찾을 수 없습니다.', 404);
  return createSuccessResponse(state.messages);
};

/** 채팅 시작(POST /chats) 응답 / Start chat response */
export const createMockStartChatResponse = (question: string): ApiResponse<ChatStart> => {
  const chatRoomId = createId('chat');
  const title = createTitleFromQuestion(question);
  const answer = respond(question);

  rooms.set(chatRoomId, {
    room: { chatRoomId, title },
    messages: [
      {
        chatId: createId('msg'),
        question,
        answer,
        image: null,
      },
    ],
  });
  roomOrder.unshift(chatRoomId);

  return createSuccessResponse({ chatRoomId, title, answer });
};

/** 기존 채팅방에 메시지 전송(POST /chats/{id}) 응답 / Send message response */
export const createMockSendMessageResponse = (
  chatRoomId: string,
  question: string,
): ApiResponse<Answer> => {
  const state = rooms.get(chatRoomId);
  if (!state) return createErrorResponse('채팅방을 찾을 수 없습니다.', 404);

  const answer = respond(question);
  state.messages.push({
    chatId: createId('msg'),
    question,
    answer,
    image: null,
  });

  return createSuccessResponse({ answer });
};

/** 채팅방 제목 수정(POST /chats/{id}/title) 응답 / Update title response */
export const createMockUpdateTitleResponse = (chatRoomId: string, title: string): ApiResponse<void> => {
  const state = rooms.get(chatRoomId);
  if (!state) return createErrorResponse('채팅방을 찾을 수 없습니다.', 404);

  state.room.title = title;
  return createSuccessResponse(undefined);
};

/**
 * 익명 채팅 메시지(POST /chats/anonymous) 응답 / Anonymous message response
 * - 현재는 userId를 저장하지 않고 응답만 반환합니다.
 */
export const createMockAnonymousMessageResponse = (question: string): ApiResponse<Answer> => {
  return createSuccessResponse({ answer: respond(question) });
};
