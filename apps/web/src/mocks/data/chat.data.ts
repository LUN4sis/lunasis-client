/**
 * LUNAsis Chat Mock Data (English user scenarios)
 * @see First 10 conversations from lunasis_with_gen_prompt.json, translated for EN users
 */

import type { ChatMessage } from '@web/features/chat/types/api.type';

/** Mock chat room: chatRoomId, title, chats */
export interface MockChatRoom {
  chatRoomId: string;
  title: string;
  createdAt: string;
  chats: ChatMessage[];
}

/**
 * User/assistant pairs (transvaginal/transrectal ultrasound, OB-GYN exams,
 * sexual history, cost, prep, side effects, nearby clinics)
 */
export const mockChatRooms: MockChatRoom[] = [
  {
    chatRoomId: 'mock-chat-001',
    title: 'Transvaginal vs transrectal ultrasound',
    createdAt: '2025-01-20T10:00:00.000Z',
    chats: [
      {
        chatId: 'c1-1',
        question: 'What’s the difference between transvaginal and transrectal ultrasound?',
        answer:
          'Both are useful for women’s health. Here’s a brief overview.\n\n---\n\n**Transvaginal ultrasound**\n• A probe is inserted into the vagina to view the uterus, ovaries, and pelvic organs\n• Usually takes **20–30 minutes**\n• Often gives clearer images than other methods\n• Some people feel minor discomfort from the probe\n\n**Transrectal ultrasound**\n• Sometimes used when transvaginal isn’t suitable (e.g. to avoid vaginal insertion)\n• May be an option if you haven’t had penetrative sex\n• The choice depends on your situation and your provider’s recommendation\n\n---\n\nYour doctor can help you decide which is right for you. If you have specific concerns, talking with your provider is the best next step.',
        image: null,
      },
      {
        chatId: 'c1-2',
        question: 'How much does it cost?',
        answer:
          'Here’s a rough cost range (varies by facility and region):\n\n• **Transvaginal ultrasound** — about **$30–100**\n• **Transrectal ultrasound** — about **$50–150**\n\n---\n\nCosts depend on location and type of center, so it’s a good idea to **call before your appointment**.\n\nIf you’d like, I can help you think through what to ask when you call.',
        image: null,
      },
      {
        chatId: 'c1-3',
        question: 'Can you recommend a good clinic nearby?',
        answer:
          '📍 **Downtown Women’s Clinic**\n\n• Focuses on women’s health\n• Rated **4.5/5** by many patients\n• About a **10-minute walk** from downtown\n\n---\n\n**When choosing a clinic, consider:**\n• Provider experience and equipment\n• Patient reviews\n• Availability and cost — **call ahead** to confirm\n\n---\n\nIf you share your area, I can suggest what to look for when searching.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-002',
    title: 'Do they do both transvaginal and transrectal at the OB-GYN?',
    createdAt: '2025-01-20T10:10:00.000Z',
    chats: [
      {
        chatId: 'c2-1',
        question: 'Does the OB-GYN usually do both transvaginal and transrectal ultrasound?',
        answer:
          '**Short answer:** It’s not common to do both in one visit.\n\n---\n\n• **Transvaginal** is usually the main exam — it tends to give clearer images\n• If that isn’t possible or comfortable for you, **transrectal** or **abdominal** ultrasound may be used instead\n\n---\n\nThe exact approach depends on your situation. Your OB-GYN can recommend the best option for you.',
        image: null,
      },
      {
        chatId: 'c2-2',
        question: 'Is there anything I need to do to prepare?',
        answer:
          'Here are typical **preparation tips** for ultrasound:\n\n---\n\n**General**\n\n1. **Day of exam** — A light breakfast (e.g. milk, oatmeal) is usually fine\n2. **Fasting** — May be needed for some abdominal exams → check with your doctor\n3. **Clothing** — Comfortable, easy-to-remove bottoms\n\n**Transrectal ultrasound**\n\n• No special prep beyond normal hygiene\n\n---\n\nYour provider may give you additional instructions. If you’d like, I can help you find nearby clinics.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-003',
    title: 'When do OB-GYNs use transrectal ultrasound?',
    createdAt: '2025-01-20T10:15:00.000Z',
    chats: [
      {
        chatId: 'c3-1',
        question: 'When would an OB-GYN do a transrectal ultrasound instead of transvaginal?',
        answer:
          'Transrectal ultrasound is used when **transvaginal isn’t the best option**. A common reason: whether you’ve had penetrative vaginal sex — the transvaginal probe can be uncomfortable or not recommended in some cases. Transrectal (or abdominal) ultrasound can be an alternative.\n\n---\n\n**Transrectal ultrasound can help with:**\n\n1. **Pelvic organ evaluation** — uterus, ovaries, blood flow, lymph nodes\n2. **Abnormal uterine bleeding** or endometrial changes\n3. **Cyst or mass evaluation** — e.g. ovarian cysts\n4. **Ectopic pregnancy** — location and extent\n5. **Chronic pelvic pain** — e.g. endometriosis, pelvic inflammatory disease\n\n---\n\nYour OB-GYN can decide what’s appropriate based on your symptoms and history.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-004',
    title: 'Is transvaginal ultrasound safe at different ages?',
    createdAt: '2025-01-20T10:20:00.000Z',
    chats: [
      {
        chatId: 'c4-1',
        question: 'Is transvaginal ultrasound safe at different ages?',
        answer:
          'Safety depends more on the **reason for the exam**, **equipment**, and **provider’s experience** than on age alone. Here’s a rough guide:\n\n---\n\n**Teens–20s**\n• Usually fine; anatomy is typically developed\n• Hormonal changes can sometimes cause findings that need a doctor’s review\n\n**30s–40s**\n• Conditions like endometriosis or cysts are more commonly found\n• The exam can be especially useful; **timing in your cycle** may matter — your doctor can advise\n\n**50+**\n• As menopause nears, the uterine lining can thin → may affect image quality\n• Ovarian function and structure may change\n• A provider experienced in this age group can help\n\n---\n\n**For all ages:** Discuss your cycle and any discomfort with your provider. If the probe causes pain, **say so during the exam**.\n\n---\n\nIf you want more detail for your age group, I can help you think through what to ask your doctor.',
        image: null,
      },
      {
        chatId: 'c4-2',
        question: 'How much does it cost?',
        answer:
          'Cost **varies by facility and region**. In many places:\n\n---\n\n• **Hospitals / larger centers** — around **$50–100** or more\n• **OB-GYN / women’s health clinics** — similar or slightly lower\n• **Smaller clinics / community health** — sometimes less for basic exams\n\n---\n\n• **Insurance** may cover part of the cost depending on the reason for the exam\n• **3D/4D** or other advanced exams may cost extra\n\n---\n\nI can help you think about what to ask when checking prices at a specific place.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-005',
    title: 'Do they ask about sexual experience before ultrasound?',
    createdAt: '2025-01-20T10:25:00.000Z',
    chats: [
      {
        chatId: 'c5-1',
        question: 'Do they ask if you’ve had sex before an ultrasound?',
        answer:
          '**Yes.** Before a pelvic ultrasound, providers often ask about sexual history and related health info.\n\n---\n\n**Why they ask:**\n\n• To **choose the right type of exam** (e.g. transvaginal vs transrectal)\n• To **interpret results** correctly\n• To understand your cycle, assess the uterus and ovaries, and rule out certain conditions\n\n---\n\nThe information is used to give you **safe and accurate care**. If you have more questions, you can ask your provider directly.',
        image: null,
      },
      {
        chatId: 'c5-2',
        question: 'What should I know or prepare beforehand?',
        answer:
          'For a **transvaginal or similar exam**, there’s usually **no major prep**.\n\n---\n\n**It can help to have ready:**\n\n• Relevant history (e.g. endometriosis)\n• Current **birth control** or **hormone use**\n• Any other health details your provider has asked about\n\n---\n\nIf you have a specific type of exam in mind, I can help you think through what to ask.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-006',
    title: 'Why do they ask about sexual experience before ultrasound?',
    createdAt: '2025-01-20T10:30:00.000Z',
    chats: [
      {
        chatId: 'c6-1',
        question: 'Why do they ask about sexual experience before an ultrasound?',
        answer:
          '**Main reason:** To choose the **safest and most appropriate** type of exam.\n\n---\n\n• They need to decide between **transvaginal** vs **transrectal** or **abdominal** ultrasound\n• They may also ask about **recent sexual activity** to tailor the exam and consider infection risk\n\n---\n\nIt can feel personal, but it’s to give you the **right care**. You can always ask your doctor to explain how it affects your specific exam.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-007',
    title: 'Can I have a transvaginal ultrasound if I’ve never had sex?',
    createdAt: '2025-01-20T10:35:00.000Z',
    chats: [
      {
        chatId: 'c7-1',
        question: 'Can I have a transvaginal ultrasound if I’ve never had sex?',
        answer:
          '**Yes.** Transvaginal ultrasound is a **standard exam** for the uterus, ovaries, and pelvic area. It can help with periods, bleeding, pain, and other symptoms — **whether or not you’ve had sex**.\n\n---\n\n**Things to know:**\n\n• The probe goes into the vagina — some people find it uncomfortable\n• **Talk with your provider beforehand**; they can help you prepare and, if needed, discuss **alternatives** (e.g. transrectal or abdominal ultrasound)\n\n---\n\nIf you want, I can help you think about questions for **cost** or **choosing a provider**.',
        image: null,
      },
      {
        chatId: 'c7-2',
        question: 'How much does it cost?',
        answer:
          'Costs **vary by facility and area**. Transvaginal ultrasound is often around **$50–100** or so. The exact amount depends on the type of exam and the center.\n\n---\n\n**If cost is a concern:**\n\n• Ask whether your **insurance** might cover it and what you’d pay **out of pocket**\n• I can help you think about what to ask when looking for an **affordable clinic**\n\n---\n\nFeel free to ask if you have more questions.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-008',
    title: 'What does the OB-GYN mean by “sexual experience”?',
    createdAt: '2025-01-20T10:40:00.000Z',
    chats: [
      {
        chatId: 'c8-1',
        question: 'What does the OB-GYN mean by “sexual experience”?',
        answer:
          'It’s one of the more **personal topics** in OB-GYN care. Providers use it to understand your health and give better advice.\n\n---\n\n**What they often mean:**\n\n• **Main focus:** Whether you’ve had **vaginal penetration**\n• They may also ask about **other contact** (e.g. oral sex, genital contact) when it’s relevant\n\n**What they might discuss:**\n\n• Symptoms (e.g. pain, discharge)\n• Periods and bleeding\n• Birth control, pregnancy risk\n• STI screening, Pap smears, etc.\n\n---\n\nThese conversations are **confidential**. The information is to support your care.',
        image: null,
      },
      {
        chatId: 'c8-2',
        question: 'Can you recommend a clinic near me?',
        answer:
          '📍 **Downtown Women’s Clinic**\n\n• About a **10-minute walk** from the center\n• Rated **4.5/5** by many patients\n\n---\n\nIf you share your **city or ZIP**, I can help you with what to look for when searching for a clinic in your area.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-009',
    title: 'Do I need to say I’ve had sex if it wasn’t with a male partner?',
    createdAt: '2025-01-20T10:45:00.000Z',
    chats: [
      {
        chatId: 'c9-1',
        question: 'If I haven’t had sex with a male partner, should I still say I’ve had sexual experience at the OB-GYN?',
        answer:
          'You **don’t have to share every detail**, but it helps to give information that’s relevant to your care.\n\n---\n\n**What they’re usually asking:**\n\n• Whether you’ve had **certain kinds of physical contact** — not your partner’s gender\n\n**You can say, for example:**\n\n• *“I haven’t had penetrative sex.”* — if you haven’t had vaginal penetration\n• *“I haven’t had vaginal sex, but I have had other contact.”* — if other contact could affect symptoms or the exam\n\n---\n\nThat’s often enough for them to choose the **right exam and care**.',
        image: null,
      },
      {
        chatId: 'c9-2',
        question: 'What should I prepare before the visit?',
        answer:
          '**Before the visit**\n\n• **Period dates** (if you have them)\n• **List of current medications**\n• **Brief notes** on any symptoms or concerns\n\n---\n\n**On the day**\n\n• **Urine sample** — you may be asked; using the bathroom beforehand can help\n• **Fasting** — usually not needed unless your provider says otherwise\n• **Clothing** — something comfortable and easy to change (you may need to undress from the waist down)\n\n---\n\nYou can have a pelvic exam **regardless of sexual history**. If anything feels uncomfortable or unclear, **it’s okay to say so**.',
        image: null,
      },
    ],
  },
  {
    chatRoomId: 'mock-chat-010',
    title: 'Side effects and what to watch for with transvaginal ultrasound',
    createdAt: '2025-01-20T10:50:00.000Z',
    chats: [
      {
        chatId: 'c10-1',
        question: 'Are there side effects or things to watch for with transvaginal ultrasound?',
        answer:
          'Transvaginal ultrasound is **generally safe**. You might feel some **pressure or discomfort** from the probe; rarely, light spotting or irritation can occur.\n\n---\n\n**Things to keep in mind**\n\n• **During your period** — the exam might be limited or rescheduled → check with your provider\n• **UTI or pelvic infection** (or suspected) — timing might be adjusted\n• **Discomfort during the exam** — tell the provider; they can slow down or adjust\n\n---\n\n**Afterward:** You can usually go back to normal activities. If you have **pain or bleeding**, **contact the clinic**.\n\n---\n\nFeel free to ask if you have more questions.',
        image: null,
      },
    ],
  },
];

/** chatRoomId → MockChatRoom */
export const mockChatRoomsById = new Map<string, MockChatRoom>(
  mockChatRooms.map((r) => [r.chatRoomId, r]),
);

/**
 * Find a mock answer for a given question (matches by similar phrasing in English).
 */
export function findMockAnswerForQuestion(question: string): string {
  const q = question.trim();
  if (!q) return mockChatRooms[0].chats[0].answer;
  const qLower = q.toLowerCase();
  for (const room of mockChatRooms) {
    for (const c of room.chats) {
      const cq = c.question.toLowerCase();
      if (cq.includes(qLower) || qLower.includes(cq.slice(0, 14))) return c.answer;
    }
  }
  return mockChatRooms[0].chats[0].answer;
}
