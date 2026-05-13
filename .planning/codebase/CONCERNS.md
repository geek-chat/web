# Concerns & Technical Debt

> Generated: 2026-05-08 | Target: geek-chat-web (v1 Expo Web)
> Server: geek-chat-server (v1 NestJS on Render)

## CRITICAL

### C1: WebSocket 연결 실패 시 사용자 피드백 없음
- **파일**: `src/socket/socket.ts:28-38`
- **증상**: 소켓 연결 실패/끊김 시 `console.log`만 — UI에 아무 표시 없음
- **영향**: 사용자가 메시지를 보내도 전달되지 않는데, 화면상으로는 정상처럼 보임 (optimistic UI)
- **수정**: 연결 상태를 store에 반영 + UI에 "연결 끊김" 배너 표시

### C2: Optimistic 메시지 실패 복구 없음
- **파일**: `src/store/chat.store.ts:88-109`
- **증상**: `sendMessage`가 `socket?.emit()` 호출 — 소켓이 null이면 조용히 무시. 메시지는 pending 상태로 영원히 남음
- **영향**: 사용자가 보낸 메시지가 "보내는 중" 상태에서 멈춤. 재전송/실패 표시 없음
- **수정**: emit 실패 감지 + timeout 후 `status: 'failed'` 전환 + 재전송 UI

### C3: 서버 환경변수 불일치 가능성 (메시지 전달 버그 원인)
- **파일**: `.env` → `EXPO_PUBLIC_API_URL=https://geek-chat-server-api.onrender.com`
- **증상**: Vercel 배포 환경변수가 로컬 .env와 다를 수 있음
- **영향**: 배포 환경에서 소켓 연결 대상이 잘못될 경우 메시지 전달 완전 차단
- **확인**: Vercel 대시보드에서 `EXPO_PUBLIC_API_URL` 값 확인 필요

## HIGH

### H1: Token refresh 시 소켓 재연결 안 됨
- **파일**: `src/hooks/useChat.ts:22-48`, `src/api/client.ts:60-79`
- **증상**: REST 401 → token refresh 성공 → REST 재시도 OK. 하지만 소켓은 옛 토큰으로 연결된 상태 유지
- **영향**: 15분(access token TTL) 후 소켓이 만료된 토큰 상태 → 서버가 메시지 거부 가능
- **수정**: token refresh 시 소켓 disconnect → 새 토큰으로 reconnect

### H2: `receiveMessage` 중복 감지 불완전
- **파일**: `src/store/chat.store.ts:112-137`
- **증상**: `m.clientMessageId === msg.id` — 수신자 측에서 `clientMessageId`는 서버 메시지 ID와 무관
- **영향**: `new_message`가 `message_ack`보다 먼저 도착하면 발신자 화면에 메시지 2개 표시 (일시적, confirmMessage에서 정리)
- **심각도**: 낮음 (자동 정리됨) 하지만 UX 깜빡임 발생

### H3: 읽음 상태 과다 emit
- **파일**: `app/(app)/chat/[roomId].tsx:66-75`
- **증상**: `useEffect`가 `messages` 배열 변경마다 `mark_read` emit — 메시지 수신, 상태 변경 등 모든 리렌더에서 발생
- **영향**: 불필요한 WebSocket 트래픽 + 서버 DB 쓰기
- **수정**: debounce 또는 메시지 ID 비교 후 변경 시에만 emit

## MEDIUM

### M1: 테스트 커버리지 극히 낮음
- **파일**: `test/unit/` — 3개 파일만 존재
- **증상**: chat.store (핵심 비즈니스 로직), client.ts (인증 흐름), socket.ts (연결 관리) 모두 테스트 없음
- **영향**: 리팩토링 시 회귀 감지 불가

### M2: 에러 처리 일관성 없음
- **파일**: 전체
- **증상**: API 에러 → `throw new Error(status)`, 소켓 에러 → `console.error`, 기타 → 무시
- **영향**: 사용자에게 유의미한 에러 메시지 전달 안 됨

### M3: Room 목록 실시간 업데이트 없음
- **파일**: `app/(app)/rooms.tsx:21-23`
- **증상**: `loadRooms()`는 mount 시 1회만 호출. 새 메시지 수신 시 room 목록의 lastMessageAt/순서 갱신 안 됨
- **영향**: 채팅방 목록이 새 메시지 반영 안 함 — 수동 새로고침 필요

### M4: `loadMessages` 무한 스크롤 미구현
- **파일**: `app/(app)/chat/[roomId].tsx:131-141`
- **증상**: FlatList에 `onEndReached` 핸들러 없음. 초기 메시지만 로드
- **영향**: 오래된 메시지 히스토리 조회 불가

## LOW

### L1: AsyncStorage 보안
- **파일**: `src/utils/token.ts`
- **증상**: Access/Refresh token이 AsyncStorage (웹에서는 localStorage)에 평문 저장
- **영향**: XSS 취약점 시 토큰 탈취 가능. 웹 환경에서는 httpOnly cookie가 더 안전

### L2: 하드코딩된 reconnection 설정
- **파일**: `src/socket/socket.ts:19-25`
- **증상**: `reconnectionAttempts: 10`, `reconnectionDelay: 1000` 등 하드코딩
- **영향**: 네트워크 환경에 따른 유연한 조정 불가
