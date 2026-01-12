import { z } from 'zod';
import type { ApiResponse } from '@repo/shared/types';

// ============================================================================
// Zod Schemas for API Response Validation
// ============================================================================

/**
 * Schema for chat room item in list
 */
export const chatRoomSchema = z.object({
  chatRoomId: z.string().uuid(),
  title: z.string(),
});

/**
 * Schema for GET /chats response data
 */
export const getChatsResponseSchema = z.array(chatRoomSchema);

/**
 * Schema for POST /chats response data
 */
export const createChatResponseSchema = z.object({
  chatRoomId: z.string().uuid(),
  answer: z.string(),
});

/**
 * Schema for chat message item
 */
export const chatMessageSchema = z.object({
  chatId: z.string().uuid(),
  question: z.string(),
  answer: z.string(),
  image: z.string().nullable(),
});

/**
 * Schema for GET /chats/[chatRoom] response data
 */
export const getChatMessagesResponseSchema = z.array(chatMessageSchema);

/**
 * Schema for POST /chats/[chatRoom] response data
 */
export const sendMessageResponseSchema = z.object({
  answer: z.string(),
});

// ============================================================================
// API Response Data Types (inferred from Zod schemas)
// ============================================================================

/**
 * Response data type for GET /chats
 */
export type GetChatsResponseData = z.infer<typeof chatRoomSchema>;

/**
 * Response data type for POST /chats
 */
export type CreateChatResponseData = z.infer<typeof createChatResponseSchema>;

/**
 * Response data type for GET /chats/[chatRoom]
 */
export type GetChatMessagesResponseData = z.infer<typeof chatMessageSchema>;

/**
 * Response data type for POST /chats/[chatRoom]
 */
export type SendMessageResponseData = z.infer<typeof sendMessageResponseSchema>;

// ============================================================================
// API Response Types (with ApiResponse wrapper)
// ============================================================================

/**
 * Full API response for GET /chats
 */
export type GetChatsApiResponse = ApiResponse<GetChatsResponseData[]>;

/**
 * Full API response for POST /chats
 */
export type CreateChatApiResponse = ApiResponse<CreateChatResponseData>;

/**
 * Full API response for GET /chats/[chatRoom]
 */
export type GetChatMessagesApiResponse = ApiResponse<GetChatMessagesResponseData[]>;

/**
 * Full API response for POST /chats/[chatRoom]
 */
export type SendMessageApiResponse = ApiResponse<SendMessageResponseData>;

// ============================================================================
// API Request Params Types
// ============================================================================

/**
 * Path parameters for chat room endpoints
 */
export interface ChatRoomParams {
  chatRoomId: string;
}
