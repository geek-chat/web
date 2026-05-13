# 배포 전 체크리스트

Vercel 배포 전 확인 스킬.

## 체크리스트

### 필수 (MUST)
- [ ] `npx tsc --noEmit` — 타입 에러 0개
- [ ] `npx jest` — 테스트 전체 통과
- [ ] `npx expo export --platform web` — 빌드 성공
- [ ] `.env` 변수 확인: `EXPO_PUBLIC_API_URL`이 v1 서버 주소인지

### 권장 (SHOULD)
- [ ] 로컬에서 `npx expo start --web` 실행 후 기본 플로우 테스트
  - 로그인 → 방 목록 → 채팅 → 메시지 전송 → 수신 확인
- [ ] 브라우저 콘솔에서 `[Socket] Connected:` 로그 확인
- [ ] git status 확인: 불필요한 파일 커밋 방지

### Vercel 환경변수 확인
```
EXPO_PUBLIC_API_URL = https://geek-chat-server-api.onrender.com
```
- 반드시 v1 서버 주소 (Render)
- v2 서버 주소 (친구 클라우드) 절대 사용 금지 — 프로토콜 불일치

### 배포 후 확인
- [ ] Vercel 배포 URL 접속 → 로그인 화면 표시
- [ ] 브라우저 콘솔에서 소켓 연결 로그 확인
- [ ] 두 브라우저 탭에서 메시지 주고받기 테스트
