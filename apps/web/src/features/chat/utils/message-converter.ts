import type { Message } from '../components/message-list';
import type { ChatMessage } from '../types/api.type';

/**
 * Converts API ChatMessage format to UI Message format
 *
 * API format: { chatId, question, answer, image }
 * UI format: [{ id, role: 'user', content }, { id, role: 'assistant', content }]
 *
 * @param chatMessages - Array of ChatMessage from API
 * @returns Array of Message for UI display
 *
 * @example
 * const apiMessages = await getChatLogAPI(chatRoomId);
 * const uiMessages = convertChatMessagesToUIMessages(apiMessages);
 * setMessages(uiMessages);
 */
export function convertChatMessagesToUIMessages(chatMessages: ChatMessage[]): Message[] {
  const messages: Message[] = [];
  // API provides no timestamps; use a fixed base time so converted messages
  // have stable, non-drifting timestamps and maintain relative ordering.
  const baseTime = new Date();

  chatMessages.forEach((chatMessage, index) => {
    // Each Q/A pair gets its own offset to preserve ordering in the list.
    const pairTimestamp = new Date(baseTime.getTime() + index * 1000);

    // Add user message (question)
    messages.push({
      id: `${chatMessage.chatId}-question`,
      role: 'user',
      content: chatMessage.question,
      timestamp: pairTimestamp,
    });

    // Add assistant message (answer) with optional image attachment
    messages.push({
      id: `${chatMessage.chatId}-answer`,
      role: 'assistant',
      content: chatMessage.answer,
      timestamp: pairTimestamp,
      ...(chatMessage.image
        ? { attachments: [{ type: 'image' as const, url: chatMessage.image, name: 'Image' }] }
        : {}),
    });
  });

  return messages;
}

/**
 * Converts a single API response (CreateChatRoomRes or AnonymousRes) to UI Messages
 *
 * @param question - User's question
 * @param answer - AI's answer
 * @param chatId - Optional chat ID (for logged-in users)
 * @returns Array of user and assistant messages
 *
 * @example
 * const response = await createChatRoomAPI({ question });
 * const messages = convertResponseToUIMessages(question, response.answer, response.chatRoomId);
 */
export function convertResponseToUIMessages(
  question: string,
  answer: string,
  chatId?: string,
): Message[] {
  const timestamp = new Date();
  const baseId = chatId || `temp-${Date.now()}`;

  return [
    {
      id: `${baseId}-question`,
      role: 'user',
      content: question,
      timestamp,
    },
    {
      id: `${baseId}-answer`,
      role: 'assistant',
      content: answer,
      timestamp,
    },
  ];
}
