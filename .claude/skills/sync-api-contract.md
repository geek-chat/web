# API 계약 동기화

서버 코드 변경 시 프론트엔드 타입/API 클라이언트를 동기화하는 스킬.

## 동기화 대상

| 서버 (v1) | 프론트 (v1) |
|---|---|
| `chat.controller.ts` 응답 형태 | `src/types/index.ts` 타입 정의 |
| `chat.gateway.ts` 이벤트 | `src/socket/socket.ts` + `src/hooks/useChat.ts` |
| `auth.controller.ts` 응답 | `src/api/auth.ts` 타입 |
| `chat.controller.ts` REST | `src/api/chat.ts` 경로/파라미터 |

## 절차

### 1. 서버 변경 감지
```bash
cd ../geek-chat-server
git diff HEAD~5 --name-only -- src/chat/presentation/ src/auth/presentation/
```

### 2. REST 엔드포인트 비교
- 서버 controller의 `@Get/@Post` 데코레이터 경로
- 프론트 `src/api/chat.ts`의 fetch 경로
- 응답 JSON shape ↔ `src/types/index.ts` 타입

### 3. WebSocket 이벤트 비교
- 서버 `@SubscribeMessage('event_name')` 목록
- 프론트 `socket.on('event_name')` 목록
- 이벤트 데이터 shape 비교

### 4. 워크스페이스 CLAUDE.md 업데이트
- `/geek-chat/CLAUDE.md`의 API 계약 테이블 갱신

## 주의

- v1 서버 코드는 참조 전용 (수정 금지)
- 서버 변경 시 프론트만 맞춤
- v2 서버와 혼동하지 않을 것
