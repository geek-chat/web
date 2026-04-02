# Components 계층

## 역할
재사용 가능한 UI 컴포넌트. 비즈니스 로직 없음.

## 규칙
- Props만 받는다. store, api, socket 직접 접근 금지.
- 스타일은 같은 파일 하단에 StyleSheet.create()로 정의.
- 다크 모드 기본. colors.ts에서 색상 참조.
- 성능 민감 컴포넌트는 React.memo 적용.

## 컴포넌트 목록
| 파일 | 역할 | memo |
|---|---|---|
| MessageBubble.tsx | 메시지 말풍선 (상태 표시, 타임스탬프, 접근성) | O |
| ChatInput.tsx | 메시지 입력창 (멀티라인, 전송 버튼) | - |
| RoomListItem.tsx | 채팅방 목록 항목 (Avatar 포함) | O |
| LoadingSpinner.tsx | 전체 화면 로딩 인디케이터 | - |
| ErrorView.tsx | 에러 상태 + 재시도 버튼 | - |
| EmptyState.tsx | 빈 상태 표시 (아이콘, 제목, 설명) | - |
| Avatar.tsx | 프로필 이미지 또는 이니셜 원형 표시 | - |
