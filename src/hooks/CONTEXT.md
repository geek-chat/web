# Hooks 계층

## 역할
화면 컴포넌트와 상태/통신 계층 사이의 비즈니스 로직 레이어.

## 규칙
- 훅 이름: use{기능} (useChatMessages, useRoomList 등)
- store, api, socket import 가능.
- 화면(app/)은 훅의 반환값만 사용.

## 훅 목록
| 파일 | 역할 |
|---|---|
| useAuth.ts | auth store 셀렉터 래퍼 |
| useChat.ts | WebSocket 연결 + 이벤트 리스너 + chat store 셀렉터 |
| useChatMessages.ts | 특정 방의 메시지 조회/전송 |
| useRoomList.ts | 채팅방 목록 + 생성 로직 |
