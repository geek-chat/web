# Store 계층 (zustand)

## 역할
클라이언트 상태 관리. 서버 상태의 로컬 캐시 역할.

## 스토어 목록
| 파일 | 책임 |
|---|---|
| auth.store.ts | 인증 상태 (token, user, login/logout) |
| chat.store.ts | 채팅 상태 (rooms, messages, Optimistic UI) |

## 규칙
- 스토어는 api/, socket/만 import한다.
- 컴포넌트에서 직접 store를 import하지 않고 hooks/를 통해 접근한다.
- Optimistic UI: sendMessage → 즉시 pending 메시지 추가 → ack 시 confirmed.
