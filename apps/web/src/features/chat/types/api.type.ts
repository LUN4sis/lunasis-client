import { z } from 'zod';

import type { ChatMessage, ChatRoom, SavedMemory } from './domain.type';

export type { ChatMessage, ChatRoom, SavedMemory };

// =========================
// Chat Zod Schemas
// =========================

export const chatRoomSchema = z.object({
  chatRoomId: z.uuid(),
  title: z.string(),
});

export const chatMessageSchema = z.object({
  chatId: z.uuid(),
  question: z.string(),
  answer: z.string(),
  image: z.string().nullable(),
});

export const createChatRoomResSchema = z.object({
  chatRoomId: z.uuid(),
  title: z.string(),
  answer: z.string(),
});

export const anonymousResSchema = z.object({
  answer: z.string(),
});

// =========================
// Personalization Zod Schemas
// =========================

export const TONE_LEVELS = ['HIGH', 'DEFAULT', 'LESS'] as const;
export type ToneLevel = (typeof TONE_LEVELS)[number];

export const savedMemorySchema = z.object({
  savedMemoryId: z.uuid(),
  savedMemory: z.string(),
});

export const updateSettingReqSchema = z.object({
  chatNickName: z.string(),
  warmth: z.enum(TONE_LEVELS),
  enthusiastic: z.enum(TONE_LEVELS),
  formal: z.enum(TONE_LEVELS),
  personalSetting: z.string().max(1000),
});

// =========================
// Chat API Response Types
// =========================

export type GetChatRoomsRes = ChatRoom[];

export interface CreateChatRoomRes {
  chatRoomId: string;
  title: string;
  answer: string;
}

export type GetChatLogRes = ChatMessage[];

export type SendMessageRes = ChatMessage[];

export interface AnonymousRes {
  answer: string;
}

export interface UpdateSettingReq {
  chatNickName: string;
  warmth: ToneLevel;
  enthusiastic: ToneLevel;
  formal: ToneLevel;
  personalSetting: string;
}

// =========================
// Personalization API Response Types
// =========================

export type GetSavedMemoriesRes = SavedMemory[];
