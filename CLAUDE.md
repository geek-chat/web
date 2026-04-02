# GeekChat Web — CLAUDE.md

## 0. 코드 컨벤션

### TypeScript
- strict mode 필수.
- any 사용 금지. unknown → 타입 가드로 좁히기.
- 컴포넌트 Props는 별도 type/interface 정의.

### React
- 함수 컴포넌트만 사용. class 컴포넌트 금지.
- 커스텀 훅: use{Name} 네이밍. 비즈니스 로직은 훅으로 분리.
- useEffect 의존성 배열 빠짐 경고를 무시하지 않는다.

### 네이밍
- 파일: kebab-case (auth.store.ts, message-bubble.tsx)
- 컴포넌트 파일: PascalCase.tsx (MessageBubble.tsx) — 예외적으로 허용
- 변수/함수: camelCase
- 상수: UPPER_SNAKE_CASE
- 타입/인터페이스: PascalCase

### 스타일
- Phase 1: StyleSheet.create() 사용 (NativeWind 등 라이브러리 추가 안 함)
- 다크 모드 기본. 라이트 모드는 Phase 2.
- 색상 팔레트를 src/theme/colors.ts에 중앙 관리.
- 간격/폰트 크기/둥글기는 src/theme/spacing.ts에서 관리.
- 공유 타입은 src/types/index.ts에 중앙 정의.

## 1. 아키텍처

### 계층 구조
```
app/ (라우팅)  →  hooks/ (로직)  →  store/ (상태)  →  api/ + socket/ (통신)
                                       ↓
                                  components/ (UI)
```

### 의존 규칙
- app/ → hooks, components만 import. store/api 직접 접근 금지.
- hooks/ → store, api, socket import 가능.
- components/ → props만 받음. store/api 직접 접근 금지.
- store/ → api, socket import 가능.
- api/, socket/ → 외부 의존 없음 (순수 통신 계층).

### Optimistic UI 패턴 (메시지 전송)
1. 사용자가 메시지 입력 → 즉시 UI에 표시 (pending 상태)
2. socket.emit('send_message', { roomId, content, clientMessageId })
3. 서버에서 message_ack 수신 → pending → confirmed 전환
4. 서버에서 new_message 수신 → 다른 사용자 메시지 추가
5. clientMessageId로 중복 방지 (같은 ID면 무시)

## 2. 서버 API 연동

### 서버 주소
- 개발: http://localhost:3000
- 프로덕션: https://geek-chat-server.onrender.com

### 인증
- Access Token은 zustand store + AsyncStorage에 저장.
- 모든 REST 요청에 Authorization: Bearer {token} 자동 첨부.
- 401 응답 시 자동 refresh → 실패 시 로그인 화면으로.
- WebSocket 연결: `io(SERVER_URL, { auth: { token } })`

### API 클라이언트 규칙
- src/api/client.ts에 공통 fetch 래퍼.
- 토큰 자동 첨부 + 401 자동 refresh + JSON 파싱.
- 개별 API 파일(auth.ts, chat.ts)은 client.ts를 사용.

## 3. 상태 관리 (zustand)

### auth.store.ts
```typescript
type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: { id: string; nickname: string; profileImageUrl?: string } | null;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  setUser: (user: AuthState['user']) => void;
}
```

### chat.store.ts
```typescript
type Room = {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  lastMessageAt: string | null;
  members: { userId: string; nickname: string; profileImageUrl?: string }[];
}

type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname?: string;
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
  status: 'pending' | 'confirmed' | 'failed';
  clientMessageId: string;
}

type ChatState = {
  rooms: Room[];
  messagesByRoom: Record<string, Message[]>;
  sendMessage: (roomId: string, content: string) => void;
  receiveMessage: (message: Message) => void;
  confirmMessage: (clientMessageId: string, serverId: string) => void;
}
```

## 4. 테스트

### 실행 명령
```bash
npx jest                          # 단위 테스트
npx expo export --platform web    # 웹 빌드
npx expo start --web              # 개발 서버
```

### 테스트 구조
- test/unit/ — 단위 테스트 (jest-expo)
- jest.config.js — Jest 설정

## 5. 배포
- Vercel: `npx expo export --platform web` → dist/ 폴더 배포
- 환경변수: EXPO_PUBLIC_API_URL

## 6. Kotlin/Spring 마이그레이션 대응 (참고)
| Expo Web | Phase 2 Mobile |
|---|---|
| expo-router (web) | expo-router (native) |
| AsyncStorage | SecureStore (모바일) |
| StyleSheet | 동일 (React Native) |
| socket.io-client | 동일 |
