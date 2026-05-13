# v1 → v2 Migration Guide Agent

geek-chat-web(v1) → geek-chat-web-v2 마이그레이션 시 참조하는 에이전트.

## 프로토콜 차이

| 항목 | v1 (web ↔ server) | v2 (web-v2 ↔ server-v2) |
|---|---|---|
| WebSocket | socket.io-client | Raw WebSocket |
| 연결 방식 | `io(URL, { auth: { token } })` | `new WebSocket(URL + '/ws?token=JWT')` |
| 메시지 형식 | socket.io 이벤트 | JSON envelope: `{ type, data }` |
| 서버 프레임워크 | NestJS + @WebSocketGateway | Spring Boot + TextWebSocketHandler |
| DB | PostgreSQL (MikroORM) | MySQL (JPA) |
| 배포 | Render | 친구 클라우드 (Docker Compose) |

## 이벤트 매핑

| v1 (socket.io event) | v2 (JSON type field) | 차이 |
|---|---|---|
| `emit('send_message', data)` | `send({ type: 'send_message', data })` | envelope 래핑 필요 |
| `on('message_ack', cb)` | `onmessage → parse → type === 'message_ack'` | 수동 라우팅 |
| `on('new_message', cb)` | `onmessage → parse → type === 'new_message'` | 수동 라우팅 |
| `on('error', cb)` | `onmessage → parse → type === 'error'` | 수동 라우팅 |

## 마이그레이션 체크리스트

1. [ ] `socket.io-client` → native `WebSocket` 전환
2. [ ] 이벤트 라우터 구현 (type 기반 dispatch)
3. [ ] 재연결 로직 직접 구현 (socket.io 자동 재연결 없어짐)
4. [ ] Rate limit 대응 (2초 미만 재연결 거부)
5. [ ] Max 3 connections per user 처리
6. [ ] `ttlSeconds` 파라미터 추가 (v2 신기능)
7. [ ] API URL 변경 (Render → 친구 클라우드)
8. [ ] CORS 도메인 설정 확인

## 주의사항

- v1 web과 v2 server는 **호환되지 않음** (소켓 프로토콜 불일치)
- v2 web과 v1 server도 **호환되지 않음**
- 반드시 같은 버전끼리 매칭: web↔server, web-v2↔server-v2
