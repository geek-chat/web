# WebSocket Debugger Agent

소켓 연결 문제 진단 전용 에이전트.

## 진단 체크리스트

### 1. 환경변수 확인
- `EXPO_PUBLIC_API_URL` 값이 v1 서버(Render)를 가리키는지 확인
- Vercel 배포 환경변수와 로컬 .env 값 비교
- v2 서버(Raw WebSocket) 주소가 아닌지 반드시 검증

### 2. 소켓 연결 상태
- `src/socket/socket.ts` — `connectSocket()` 호출 시점 확인
- `app/(app)/_layout.tsx` — `useChat()` 훅에서 소켓 초기화 확인
- 브라우저 콘솔에서 `[Socket] Connected:` 로그 확인
- `[Socket] Disconnected:` 사유 확인

### 3. 이벤트 흐름 확인
```
Client emit: 'send_message' → { roomId, content, clientMessageId }
Server ack:  'message_ack'  → { clientMessageId, serverId }
Server broadcast: 'new_message' → { id, roomId, senderId, content, type, createdAt }
```

### 4. 서버 측 확인 (v1 NestJS)
- `chat.gateway.ts` — `handleConnection` 성공 로그
- `chat.gateway.ts` — `handleSendMessage` 처리 로그
- `broadcast-message.handler.ts` — `message_broadcast` 로그
- 서버의 `FRONTEND_URL` 환경변수가 Vercel 도메인과 일치하는지 (CORS)

### 5. 핵심 실패 모드
| 증상 | 원인 | 해결 |
|---|---|---|
| 내 메시지만 보임 | 소켓 미연결 (optimistic UI만 동작) | 소켓 연결 상태 확인 |
| message_ack 안 옴 | 서버가 메시지 수신 못함 | 서버 로그 확인 |
| new_message 안 옴 | Room join 안 됨 or CORS 차단 | handleConnection 로그 확인 |
| 상대방 새로고침 후 보임 | 소켓 OK지만 broadcast 지연 | 서버 이벤트 핸들러 확인 |

### 6. 프로토콜 호환성
- v1 서버: socket.io → `io(URL, { auth: { token } })`
- v2 서버: Raw WebSocket → `new WebSocket(URL + '/ws?token=...')`
- **절대 섞이면 안 됨** — 프로토콜 불일치 시 조용히 실패
