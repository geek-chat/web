# GeekChat Web — Agent Guide

> v1 Expo Web 채팅 클라이언트 | 서버: geek-chat-server (v1 NestJS)

## Architecture Overview

```
app/ (Expo Router)
  ├── _layout.tsx          → Auth hydration
  ├── (auth)/              → OAuth callback, account linking
  └── (app)/
      ├── _layout.tsx      → useChat() socket init
      ├── rooms.tsx        → Room list + user search
      └── chat/[roomId]    → Chat screen

src/
  hooks/  → useAuth, useChat, useChatMessages, useRoomList, useUserSearch
  store/  → auth.store.ts (zustand), chat.store.ts (zustand)
  api/    → client.ts (fetch wrapper + 401 refresh), auth.ts, chat.ts, users.ts
  socket/ → socket.ts (socket.io-client singleton)
  components/ → Pure UI (props only): MessageBubble, ChatInput, Avatar, ...
  theme/  → colors.ts, spacing.ts (dark mode default)
  types/  → User, Room, Message, MessageResponse
  utils/  → date.ts, token.ts (AsyncStorage)
```

## Data Flow: Message Send

```
User types → ChatInput.onSend
  → chat.store.sendMessage (optimistic: pending message added)
  → socket.emit('send_message', { roomId, content, clientMessageId })
  → Server saves to DB
  → Server emits 'message_ack' to sender (clientMessageId → serverId)
  → Server broadcasts 'new_message' to room (all members)
  → chat.store.confirmMessage (pending → confirmed)
  → chat.store.receiveMessage (other users)
```

## Key Dependencies

| Package | Version | Role |
|---|---|---|
| expo | ~52.0.37 | Framework |
| expo-router | ~4.0.17 | File-based routing |
| react-native | 0.76.7 | UI runtime |
| zustand | ^5.0.3 | State management |
| socket.io-client | ^4.8.1 | WebSocket (v1 server) |
| uuid | ^11.1.0 | clientMessageId generation |

## Server (v1) Connection

- **REST**: `EXPO_PUBLIC_API_URL` (default: `http://localhost:3000`)
- **WebSocket**: socket.io → `io(SERVER_URL, { auth: { token } })`
- **Auth**: JWT access (15min) + refresh (14d, rotation)

## Critical Rules

1. **Layer 의존**: app → hooks/components | hooks → store/api/socket | components → props only
2. **v1 서버 기준**: socket.io 프로토콜. v2 서버(Raw WebSocket)와 호환 안 됨
3. **테스트 정책**: 테스트 파일 수정 금지. 프로덕션 코드만 수정
4. **Stop hook**: `npx tsc --noEmit && npx jest` — 타입+테스트 통과 필수

## Known Issues

- 소켓 연결 상태 UI 피드백 없음 (CONCERNS.md C1)
- Optimistic 메시지 실패 복구 없음 (CONCERNS.md C2)
- Token refresh 시 소켓 재연결 안 됨 (CONCERNS.md H1)
