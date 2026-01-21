import { z } from 'zod';
import type { ApiResponse } from '@repo/shared/types';

// =========================
// Zod Schemas
// =========================

export const chatRoomSchema = z.object({
  chatRoomId: z.string(),
  title: z.string(),
});

export const chatStartSchema = z.object({
  chatRoomId: z.string(),
  title: z.string(),
  answer: z.string(),
});

export const chatMessageSchema = z.object({
  chatId: z.string(),
  question: z.string(),
  answer: z.string(),
  image: z.string().nullable(),
});

export const answerSchema = z.object({
  answer: z.string(),
});

// =========================
// Data Types
// =========================

export type ChatRoom = z.infer<typeof chatRoomSchema>;
export type ChatStart = z.infer<typeof chatStartSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Answer = z.infer<typeof answerSchema>;

// =========================
// API Response Types
// =========================

export type ChatRoomRes = ApiResponse<ChatRoom[]>;
export type ChatStartRes = ApiResponse<ChatStart>;
export type ChatMessagesRes = ApiResponse<ChatMessage[]>;
export type MessageRes = ApiResponse<Answer>;

// =========================
// API Request Types
// =========================

export interface ChatRoomParams {
  chatRoomId: string;
}

export interface QuestionReq {
  question: string;
}

export interface AnonymousReq {
  userId: string;
  question: string;
}

export interface UpdateTitleReq {
  title: string;
}