# Types 계층

## 역할
여러 모듈에서 공유하는 도메인 타입의 단일 소스.

## 파일
- `index.ts` — User, Room, RoomMember, Message, MessageStatus, MessageResponse

## 규칙
- 새 공유 타입은 여기에 정의.
- store, api, component에서 인라인 타입 정의 대신 이 파일에서 import.
- api/chat.ts, store/chat.store.ts는 하위 호환을 위해 re-export 유지.
