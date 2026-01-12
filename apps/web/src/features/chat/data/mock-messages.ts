/**
 * Mock data for chat feature development and testing
 */

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ============================================================================
// Sample Conversation Messages
// ============================================================================

export const mockMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: "Hi, I'm Luna!\n\nI'm your AI-powered wellness companion. How can I help you today?",
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
  },
  {
    id: '2',
    role: 'user',
    content: "Where is the nearest women's health clinic open on weekends?",
    timestamp: new Date(Date.now() - 1000 * 60 * 8), // 8 minutes ago
  },
  {
    id: '3',
    role: 'assistant',
    content:
      "I can help you find nearby clinics! Based on your location, here are some women's health clinics open on weekends:\n\n1. Gangnam Women's Clinic - Open Sat-Sun 9AM-5PM\n2. Seoul Women's Hospital - Open Sat 9AM-3PM\n\nWould you like more details about any of these?",
    timestamp: new Date(Date.now() - 1000 * 60 * 7), // 7 minutes ago
  },
  {
    id: '4',
    role: 'user',
    content: "Tell me more about Gangnam Women's Clinic",
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: '5',
    role: 'assistant',
    content:
      "Gangnam Women's Clinic is a well-rated facility in Seoul:\n\n- Rating: 4.5/5 stars\n- Location: Gangnam-gu, Seoul\n- Services: General gynecology, prenatal care, wellness checks\n- Weekend hours: Sat-Sun 9AM-5PM\n\nPatients particularly appreciate their friendly staff and short wait times.",
    timestamp: new Date(Date.now() - 1000 * 60 * 4), // 4 minutes ago
  },
];

// ============================================================================
// AI Response Templates (for mock API)
// ============================================================================

export const mockAiResponses = [
  'I can help you with that! Let me provide you with some information based on your question.',
  "That's a great question. Here's what I found: Women's health is an important topic that deserves careful attention.",
  "Based on the information you've provided, I'd recommend consulting with a healthcare professional for personalized advice.",
  'I understand your concern. Let me explain this in more detail to help you better understand.',
  'Thank you for sharing that with me. Here are some insights that might be helpful for your situation.',
];

// ============================================================================
// Mock Chat Rooms
// ============================================================================

export const mockChatRooms = [
  {
    chatRoomId: 'chat-001',
    title: "Women's Health Clinic Inquiry",
  },
  {
    chatRoomId: 'chat-002',
    title: 'Wellness Checkup Questions',
  },
  {
    chatRoomId: 'chat-003',
    title: 'Prenatal Care Information',
  },
];
