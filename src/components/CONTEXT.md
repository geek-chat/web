# Components 계층

## 역할
재사용 가능한 UI 컴포넌트. 비즈니스 로직 없음.

## 규칙
- Props만 받는다. store, api, socket 직접 접근 금지.
- 스타일은 같은 파일 하단에 StyleSheet.create()로 정의.
- 다크 모드 기본. colors.ts에서 색상 참조.

## 컴포넌트 목록
| 파일 | 역할 |
|---|---|
| MessageBubble.tsx | 메시지 말풍선 (내 메시지/상대 메시지 구분) |
| ChatInput.tsx | 메시지 입력창 + 전송 버튼 |
| RoomListItem.tsx | 채팅방 목록 항목 |
