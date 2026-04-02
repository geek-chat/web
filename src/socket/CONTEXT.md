# Socket 계층

## 역할
서버 WebSocket(Socket.io)과의 연결 및 이벤트 관리.

## 이벤트 계약 (서버 기준)
| 이벤트 | 방향 | Payload |
|---|---|---|
| send_message | emit | { roomId, content, clientMessageId } |
| message_ack | on | { clientMessageId, serverId } |
| new_message | on | { id, roomId, senderId, content, type, createdAt } |
| typing_start | emit | { roomId } |
| typing_indicator | on | { roomId, userId } |
| mark_read | emit | { roomId, lastReadMessageId } |
| read_update | on | { roomId, userId, lastReadAt } |
| error | on | { code, message } |

## 연결 규칙
- 연결 시 auth.token에 JWT 전달: `io(URL, { auth: { token } })`
- 자동 재연결 활성화 (socket.io 기본값).
- 연결 성공 시 서버가 사용자의 모든 채팅방에 자동 join.
- 연결 끊김 시 UI에 상태 표시.

## 파일
- socket.ts: Socket.io 연결 생성 + 이벤트 바인딩
