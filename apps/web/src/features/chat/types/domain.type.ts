// =========================
// Chat Domain Entities
// =========================

export interface ChatRoom {
  chatRoomId: string;
  title: string;
}

export interface ChatMessage {
  chatId: string;
  question: string;
  answer: string;
  image: string | null;
}

// =========================
// Personalization Domain Entities
// =========================

export interface SavedMemory {
  savedMemoryId: string;
  savedMemory: string;
}
