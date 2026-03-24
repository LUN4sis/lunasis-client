import type { ToneLevel } from './api.type';
import type { SavedMemory } from './domain.type';

// =========================
// Chat Store Types
// =========================

/**
 * 초기 채팅방 생성 후 페이지 이동 시 전달할 메시지 데이터
 *
 * @description
 * - POST /chats로 채팅방 생성 후 새 채팅방으로 이동할 때 사용
 * - 깜빡임 없이 즉시 메시지를 표시하기 위해 임시로 저장
 * - 페이지 이동 후 실제 API 응답으로 교체됨
 *
 * @remarks
 * UX 플로우:
 * 1. 사용자가 첫 질문 입력
 * 2. API 호출 중 로딩 표시
 * 3. 응답 받으면 PendingMessage에 저장
 * 4. 새 채팅방으로 라우팅
 * 5. 라우팅된 페이지에서 PendingMessage 읽어서 즉시 표시
 * 6. 실제 API 데이터 로드 완료 후 교체
 */
export interface PendingMessage {
  question: string;
  answer: string;
  timestamp: Date;
}

export interface ChatState {
  currentChatId: string | null;
  isIncognito: boolean;
  isSidebarOpen: boolean;
  isWebSearchEnabled: boolean;
  isAlertOpen: boolean;
  pendingMessages: PendingMessage | null;
  isHydrated: boolean;
}

export interface ChatActions {
  setCurrentChatId: (id: string | null) => void;
  toggleIncognito: () => void;
  toggleSidebar: () => void;
  toggleWebSearch: () => void;
  setAlertOpen: (open: boolean) => void;
  setPendingMessages: (messages: PendingMessage | null) => void;
  clearPendingMessages: () => void;
  reset: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export type ChatStore = ChatState & ChatActions;

// =========================
// Personalization Store Types
// =========================

export interface PersonalizationState {
  chatNickName: string;
  warmth: ToneLevel;
  enthusiastic: ToneLevel;
  formal: ToneLevel;
  personalSetting: string;
  savedMemories: SavedMemory[];
  isHydrated: boolean;
}

export interface PersonalizationActions {
  setChatNickName: (name: string) => void;
  setWarmth: (level: ToneLevel) => void;
  setEnthusiastic: (level: ToneLevel) => void;
  setFormal: (level: ToneLevel) => void;
  setPersonalSetting: (setting: string) => void;
  setSavedMemories: (memories: SavedMemory[]) => void;
  removeMemory: (savedMemoryId: string) => void;
  reset: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export type PersonalizationStore = PersonalizationState & PersonalizationActions;
