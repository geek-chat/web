# GeekChat Web — 프론트엔드 내부 개선 (서버 독립)

## 이 프롬프트의 목적
서버 코드를 참조하지 않고 프론트엔드 자체적으로 수행하는 내부 품질 개선.
API 형태나 소켓 이벤트 변경은 포함하지 않는다.

## 핵심 원칙
- 기존 동작을 깨뜨리지 않는다.
- 각 작업 완료 후 `npx tsc --noEmit` 통과 필수.
- CLAUDE.md, CONTEXT.md를 변경 사항에 맞게 업데이트.

---

## 작업 1: 테마 시스템 구축

### 1-1. src/theme/colors.ts
```typescript
export const colors = {
  // 배경
  bg: {
    primary: '#0f0f23',
    secondary: '#1a1a2e',
    tertiary: '#16213e',
    input: '#1e1e3a',
  },
  // 텍스트
  text: {
    primary: '#e0e0e0',
    secondary: '#888888',
    placeholder: '#555555',
    inverse: '#0f0f23',
  },
  // 액센트
  accent: {
    primary: '#4a6cf7',
    success: '#2ecc71',
    error: '#e74c3c',
    warning: '#f39c12',
  },
  // 메시지 말풍선
  bubble: {
    mine: '#4a6cf7',
    mineText: '#ffffff',
    other: '#1e1e3a',
    otherText: '#e0e0e0',
  },
  // 구분선/보더
  border: '#2a2a4a',
  // 상태
  status: {
    pending: '#f39c12',
    confirmed: '#2ecc71',
    failed: '#e74c3c',
    online: '#2ecc71',
    offline: '#555555',
  },
} as const;
```

### 1-2. src/theme/spacing.ts
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  title: 28,
} as const;

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;
```

### 1-3. src/theme/index.ts
배럴 export. 외부에서는 `import { colors, spacing } from '../theme'`

### 1-4. 기존 하드코딩된 색상/수치를 테마 상수로 교체
모든 StyleSheet.create()에서 하드코딩된 색상 코드와 숫자를 찾아서 테마 상수로 교체.

---

## 작업 2: 공통 UI 컴포넌트

### 2-1. src/components/LoadingSpinner.tsx
전체 화면 로딩 인디케이터. ActivityIndicator 래핑.

### 2-2. src/components/ErrorView.tsx
에러 상태 표시. Props: `{ message: string; onRetry?: () => void }`
재시도 버튼 포함.

### 2-3. src/components/EmptyState.tsx
빈 상태 표시. Props: `{ icon?: string; title: string; description?: string }`
채팅방 없음, 메시지 없음 등에 사용.

### 2-4. src/components/Avatar.tsx
사용자 프로필 이미지 또는 이니셜 표시.
Props: `{ uri?: string; name: string; size?: number }`
이미지 없으면 이름 첫 글자를 원형 배경에 표시.

---

## 작업 3: MessageBubble 개선

### 현재 상태 확인 후 아래 적용:

- 내 메시지 / 상대 메시지 시각적 구분 (좌/우 정렬, 색상)
- 전송 상태 표시:
  - pending: 시계 아이콘 또는 투명도
  - confirmed: 체크 아이콘
  - failed: 빨간 느낌표 + 재전송 탭
- 타임스탬프 표시 (HH:mm 형식, 같은 분 메시지는 마지막에만)
- React.memo 적용 (props 변경 없으면 리렌더링 방지)
- 접근성: accessibilityLabel에 "보낸 사람, 내용, 시간" 포함

---

## 작업 4: ChatInput 개선

- 멀티라인 입력 지원 (TextInput multiline, 최대 5줄)
- 빈 메시지 전송 방지 (trim 후 빈 문자열이면 전송 버튼 비활성화)
- 전송 버튼 비활성화 상태 시각적 표현
- 키보드 회피: KeyboardAvoidingView 또는 expo-keyboard-controller 적용
- 전송 후 입력창 자동 포커스 유지
- 접근성: 전송 버튼에 accessibilityLabel="메시지 전송"

---

## 작업 5: FlatList 성능 최적화

채팅 메시지 목록 (chat/[roomId].tsx):

```typescript
// 필수 최적화 Props
<FlatList
  data={messages}
  renderItem={renderMessage}
  keyExtractor={(item) => item.clientMessageId || item.id}
  inverted                          // 최신 메시지가 아래
  initialNumToRender={20}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
  getItemLayout={getItemLayout}     // 고정 높이면 적용
/>
```

채팅방 목록 (rooms.tsx):
- 같은 패턴 적용
- RoomListItem에 React.memo

---

## 작업 6: 커스텀 훅 분리

화면 컴포넌트(app/ 하위)에 비즈니스 로직이 있으면 hooks/로 추출.

### 규칙
- 훅 이름: use{화면명}{기능} — `useChatMessages`, `useRoomList`
- 훅은 store, api, socket을 import
- 화면은 훅의 반환값만 사용

### 예시 구조
```typescript
// src/hooks/useChatMessages.ts
export function useChatMessages(roomId: string) {
  const messages = useChatStore((s) => s.messagesByRoom[roomId] || []);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const send = useCallback((content: string) => {
    sendMessage(roomId, content);
  }, [roomId, sendMessage]);

  return { messages, send };
}
```

---

## 작업 7: 타입 정리

### src/types/index.ts
여러 파일에서 공유하는 타입을 한 곳에 모은다:

```typescript
export type User = {
  id: string;
  nickname: string;
  profileImageUrl?: string;
};

export type Room = {
  id: string;
  name: string;
  type: 'DIRECT' | 'GROUP';
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  type: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'failed';
  clientMessageId: string;
};

export type MessageStatus = Message['status'];
```

기존 store, component에서 인라인으로 정의한 타입을 이 파일에서 import하도록 수정.

---

## 작업 8: 유틸 함수 + 테스트

### src/utils/date.ts
```typescript
/** "14:30" 형식으로 시간 포맷 */
export function formatTime(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/** 같은 날짜인지 비교 */
export function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}
```

### 테스트 작성
test/unit/ 하위에 아래 테스트 추가:
- `date.test.ts`: formatTime, isSameDay
- `auth.store.test.ts`: login → isAuthenticated true, logout → false
- `token.test.ts`: setTokens → getAccessToken 정합성

---

## 작업 9: 접근성(a11y) 전수 검사

모든 Pressable/TouchableOpacity에:
- `accessibilityRole="button"`
- `accessibilityLabel` (시각적 텍스트가 없는 버튼은 필수)

모든 TextInput에:
- `accessibilityLabel`
- `placeholder`

모든 Image에:
- `accessibilityLabel` 또는 `accessible={false}` (장식용)

---

## 작업 10: CONTEXT.md + CLAUDE.md 업데이트

모든 작업 완료 후:
1. `src/components/CONTEXT.md` — 새로 추가된 컴포넌트 반영
2. `src/theme/CONTEXT.md` — 테마 시스템 문서 생성
3. `src/types/CONTEXT.md` — 공유 타입 문서 생성
4. `src/hooks/CONTEXT.md` — 훅 목록 + 규칙 생성
5. `CLAUDE.md` — 디렉터리 구조에 theme/, types/ 추가

---

## 작업 11: 검증

1. `npx tsc --noEmit` → 0 에러
2. `npx expo start --web` → 개발 서버 실행
3. 브라우저에서 화면 확인:
   - 로그인 화면: 다크 모드 + 버튼 2개
   - 채팅 화면: 메시지 말풍선 좌/우 정렬 + 상태 표시
   - 빈 상태: EmptyState 컴포넌트 표시
4. 테스트: `npx jest` (또는 프로젝트에 설정된 테스트 명령)

---

## 작업 12: git commit + push

```bash
git add -A
git commit -m "improve: theme system + components + performance + a11y + tests"
git push origin main
```

---

## 주의사항
- API 호출 로직(src/api/), 소켓 이벤트(src/socket/socket.ts)는 수정하지 않는다.
- 서버 엔드포인트 변경이 필요한 작업은 이 세션에서 하지 않는다.
- 새 의존성 추가 시 반드시 이유를 리포트에 기록한다.
- 하드코딩된 색상/수치를 발견하면 무조건 테마 상수로 교체한다.
