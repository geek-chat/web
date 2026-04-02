# 서버 API 연동 스킬

서버 코드 참조 경로: ../geek-chat-server/

## API 변경 시 확인 절차
1. 서버의 controller/gateway에서 실제 엔드포인트/이벤트 확인
2. 프론트의 api/*.ts, socket/socket.ts 타입 업데이트
3. 워크스페이스 CLAUDE.md의 API 계약 테이블 업데이트
4. 프론트의 src/socket/CONTEXT.md 이벤트 테이블 업데이트

## REST 호출 규칙
- 모든 요청은 src/api/client.ts 경유
- 토큰 자동 첨부, 401 자동 refresh
- 타입은 서버 DTO와 이름 통일 (SendMessageDto 등)
- REST 엔드포인트 경로: /api/rooms (not /chat/rooms)

## WebSocket 규칙
- socket.io-client 사용
- 연결: `io(SERVER_URL, { auth: { token } })` (query param 아님)
- 이벤트 이름은 서버 gateway의 @SubscribeMessage와 정확히 일치
