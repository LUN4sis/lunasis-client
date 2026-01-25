# Chat API 문서

프론트엔드 개발자를 위한 Chat API 가이드입니다.

---

## 📋 목차
1. [개요](#개요)
2. [인증](#인증)
3. [API 사용 흐름](#api-사용-흐름)
4. [API 엔드포인트 상세](#api-엔드포인트-상세)
5. [에러 응답](#에러-응답)

---

## 개요

Chat API는 AI 기반 대화 기능을 제공합니다. 로그인 사용자와 비로그인(익명) 사용자 모두 사용할 수 있으며, 로그인 사용자는 대화 기록을 저장하고 관리할 수 있습니다.

### 기본 URL
```
/chats
```

### 공통 응답 형식
모든 응답은 아래 형식으로 래핑됩니다:
```json
{
  "code": 200,
  "message": "OK",
  "data": { ... }
}
```

---

## 인증

| API | 인증 필요 여부 |
|-----|---------------|
| 채팅 시작 | ✅ 필요 |
| 채팅 보내기 | ✅ 필요 |
| 익명 채팅 | ❌ 불필요 |
| 채팅방 목록 조회 | ✅ 필요 |
| 대화 내역 조회 | ✅ 필요 |
| 채팅방 제목 수정 | ✅ 필요 |

인증이 필요한 API는 요청 헤더에 JWT 토큰을 포함해야 합니다:
```
Authorization: Bearer {access_token}
```

---

## API 사용 흐름

### 🔐 로그인 사용자 흐름

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        로그인 사용자 채팅 흐름                            │
└─────────────────────────────────────────────────────────────────────────┘

1️⃣ 새로운 대화 시작
   POST /chats (첫 질문과 함께)
         │
         ▼
   ┌─────────────────────────────────────┐
   │ 응답: chatRoomId, title, answer     │
   │ → chatRoomId를 저장해두세요!         │
   └─────────────────────────────────────┘
         │
         ▼
2️⃣ 이어서 대화하기 (반복)
   POST /chats/{chatRoomId}
         │
         ▼
   ┌─────────────────────────────────────┐
   │ 응답: answer                        │
   └─────────────────────────────────────┘

───────────────────────────────────────────────────────────────────────────

📂 기존 대화 불러오기

1️⃣ 채팅방 목록 조회
   GET /chats
         │
         ▼
   ┌─────────────────────────────────────┐
   │ 응답: [{chatRoomId, title}, ...]    │
   └─────────────────────────────────────┘
         │
         ▼
2️⃣ 특정 채팅방 대화 내역 조회
   GET /chats/{chatRoomId}
         │
         ▼
   ┌─────────────────────────────────────┐
   │ 응답: [{chatId, question, answer,   │
   │        image}, ...]                 │
   └─────────────────────────────────────┘
```

### 👤 비로그인 사용자(익명) 흐름

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        익명 사용자 채팅 흐름                              │
└─────────────────────────────────────────────────────────────────────────┘

⚠️ 프론트엔드에서 임시 UUID를 생성하여 로컬에서 관리해야 합니다.

1️⃣ 익명 채팅 (반복)
   POST /chats/anonymous
   Body: { anonymousId: "UUID", question: "질문" }
         │
         ▼
   ┌─────────────────────────────────────┐
   │ 응답: answer                        │
   │ ⚠️ 서버에 대화 기록이 저장되지 않음    │
   │ → 필요시 프론트에서 관리              │
   └─────────────────────────────────────┘
```

---

## API 엔드포인트 상세

### 1. 채팅 시작 (새 채팅방 생성)

**용도**: 새로운 대화를 시작하고 채팅방을 생성합니다.

| 항목 | 내용 |
|------|------|
| **Endpoint** | `POST /chats` |
| **인증** | 필요 |
| **사용 시점** | 사용자가 새로운 대화를 시작할 때 |

#### Request
```json
{
  "question": "string (필수) - 첫 번째 질문"
}
```

#### Response
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "chatRoomId": "UUID - 채팅방 고유 ID (이후 대화에서 사용)",
    "title": "string - AI가 생성한 채팅방 제목",
    "answer": "string - AI의 답변"
  }
}
```

#### 사용 예시
```javascript
const response = await fetch('/chats', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    question: "Lunasis가 뭐야?"
  })
});

const { data } = await response.json();
// data.chatRoomId를 저장하여 이후 대화에서 사용
```

---

### 2. 채팅 보내기 (기존 채팅방에서 대화)

**용도**: 기존 채팅방에서 대화를 이어갑니다.

| 항목 | 내용 |
|------|------|
| **Endpoint** | `POST /chats/{chatRoomId}` |
| **인증** | 필요 |
| **사용 시점** | 채팅 시작 이후 대화를 이어갈 때 |

#### Path Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `chatRoomId` | UUID | 채팅방 ID (채팅 시작 시 받은 값) |

#### Request
```json
{
  "question": "string (필수) - 질문"
}
```

#### Response
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "answer": "string - AI의 답변"
  }
}
```

#### 사용 예시
```javascript
const response = await fetch(`/chats/${chatRoomId}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    question: "더 자세히 알려줘"
  })
});
```

---

### 3. 익명 채팅 (비로그인 사용자용)

**용도**: 로그인하지 않은 사용자가 AI와 대화합니다. 서버에 대화 기록이 저장되지 않습니다.

| 항목 | 내용 |
|------|------|
| **Endpoint** | `POST /chats/anonymous` |
| **인증** | 불필요 |
| **사용 시점** | 비로그인 상태에서 채팅할 때 |

#### Request
```json
{
  "anonymousId": "UUID (필수) - 프론트에서 생성/관리하는 임시 ID",
  "question": "string (필수) - 질문"
}
```

#### Response
```json
{
  "code": 200,
  "message": "OK",
  "data": {
    "answer": "string - AI의 답변"
  }
}
```

#### 사용 예시
```javascript
// 프론트엔드에서 anonymousId 생성 및 로컬 저장
const anonymousId = localStorage.getItem('anonymousId') || crypto.randomUUID();
localStorage.setItem('anonymousId', anonymousId);

const response = await fetch('/chats/anonymous', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    anonymousId,
    question: "Lunasis가 뭐야?"
  })
});
```

#### ⚠️ 주의사항
- `anonymousId`는 프론트엔드에서 생성하고 로컬(localStorage 등)에 저장하여 관리해야 합니다.
- 같은 `anonymousId`로 대화하면 AI가 문맥을 유지합니다.
- 서버에는 대화 기록이 저장되지 않으므로, 필요시 프론트엔드에서 별도로 관리해야 합니다.

---

### 4. 채팅방 목록 조회

**용도**: 사용자의 모든 채팅방 목록을 조회합니다.

| 항목 | 내용 |
|------|------|
| **Endpoint** | `GET /chats` |
| **인증** | 필요 |
| **사용 시점** | 대화 목록 화면에서 |

#### Response
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "chatRoomId": "UUID - 채팅방 ID",
      "title": "string - 채팅방 제목"
    },
    ...
  ]
}
```

#### 사용 예시
```javascript
const response = await fetch('/chats', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data: chatRooms } = await response.json();
// chatRooms를 목록으로 표시
```

---

### 5. 채팅방 대화 내역 조회

**용도**: 특정 채팅방의 전체 대화 내역을 조회합니다.

| 항목 | 내용 |
|------|------|
| **Endpoint** | `GET /chats/{chatRoomId}` |
| **인증** | 필요 |
| **사용 시점** | 이전 대화를 불러올 때 |

#### Path Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `chatRoomId` | UUID | 조회할 채팅방 ID |

#### Response
```json
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "chatId": "UUID - 개별 대화 ID",
      "question": "string - 사용자 질문",
      "answer": "string - AI 답변",
      "image": "string (nullable) - 이미지 URL"
    },
    ...
  ]
}
```

#### 사용 예시
```javascript
const response = await fetch(`/chats/${chatRoomId}`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const { data: chatHistory } = await response.json();
// chatHistory를 대화 UI에 렌더링
```

---

### 6. 채팅방 제목 수정

**용도**: 채팅방의 제목을 수정합니다.

| 항목 | 내용 |
|------|------|
| **Endpoint** | `POST /chats/{chatRoomId}/title` |
| **인증** | 필요 |
| **사용 시점** | 사용자가 채팅방 제목을 변경할 때 |

#### Path Parameters
| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `chatRoomId` | UUID | 수정할 채팅방 ID |

#### Request
```json
{
  "title": "string (필수) - 새로운 제목"
}
```

#### Response
```
204 No Content (응답 본문 없음)
```

#### 사용 예시
```javascript
await fetch(`/chats/${chatRoomId}/title`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    title: "새로운 채팅방 제목"
  })
});
```

---

## 에러 응답

### 공통 에러 형식
```json
{
  "code": 에러코드,
  "message": "에러 메시지"
}
```

### Chat API 관련 에러

| HTTP 상태 | 코드 | 메시지 | 설명 |
|----------|------|--------|------|
| 403 | 403 | 자신의 채팅 방에 관련된 요청만 보낼 수 있습니다 | 다른 사용자의 채팅방에 접근 시도 |
| 404 | 404 | 해당 채팅방은 존재 하지 않습니다 | 존재하지 않는 chatRoomId |
| 401 | 401 | Unauthorized | 인증 토큰 없음/만료 |

---

## 📝 프론트엔드 구현 체크리스트

### 로그인 사용자
- [ ] 채팅 시작 시 `POST /chats` 호출 후 `chatRoomId` 저장
- [ ] 이어지는 대화는 `POST /chats/{chatRoomId}` 사용
- [ ] 채팅방 목록 화면에서 `GET /chats` 호출
- [ ] 채팅방 클릭 시 `GET /chats/{chatRoomId}`로 대화 내역 로드
- [ ] 채팅방 제목 수정 기능 구현 시 `POST /chats/{chatRoomId}/title` 사용

### 비로그인 사용자
- [ ] `anonymousId`를 UUID로 생성하여 localStorage에 저장
- [ ] 모든 대화에 같은 `anonymousId` 사용하여 문맥 유지
- [ ] 대화 기록이 필요하면 프론트엔드에서 별도 저장

---

*Last Updated: 2026-01-25*

