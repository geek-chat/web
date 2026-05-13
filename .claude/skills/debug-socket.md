# 소켓 연결 진단

WebSocket 연결 문제 발생 시 실행하는 진단 스킬.

## 실행 절차

### Step 1: 환경변수 확인
```bash
# 로컬 .env
cat .env | grep EXPO_PUBLIC_API_URL

# Vercel 배포 환경 (CLI 필요)
# vercel env ls
```
- v1 서버 주소: `https://geek-chat-server-api.onrender.com`
- v2 서버 주소와 혼동하지 않을 것

### Step 2: v1 서버 헬스체크
```bash
curl -s https://geek-chat-server-api.onrender.com/health | jq
```
- `status: "ok"` 확인
- uptime이 매우 짧으면 콜드스타트 의심

### Step 3: 소켓 연결 테스트 (브라우저 콘솔)
```javascript
// 배포 사이트에서 F12 → Console
// socket.io 연결 상태 확인
const socket = window.__SOCKET_DEBUG__;  // 디버그용 전역 변수 (없으면 추가 필요)
console.log('connected:', socket?.connected);
console.log('id:', socket?.id);
```

### Step 4: 서버 CORS 확인
v1 서버 `chat.gateway.ts`:
```
FRONTEND_URL 환경변수 = Vercel 배포 도메인과 일치해야 함
```

### Step 5: 소켓 이벤트 모니터링
```javascript
// 브라우저 콘솔에서 실행
const s = io('https://geek-chat-server-api.onrender.com', {
  auth: { token: '<JWT>' },
  transports: ['websocket']
});
s.on('connect', () => console.log('OK:', s.id));
s.on('connect_error', (e) => console.error('FAIL:', e.message));
s.on('new_message', (m) => console.log('MSG:', m));
```

## 결과 판정

| 결과 | 의미 | 다음 단계 |
|---|---|---|
| connect 성공 + new_message 수신 | 소켓 정상 | 클라이언트 코드 확인 |
| connect 성공 + new_message 미수신 | Room join 실패 | 서버 handleConnection 로그 |
| connect_error | CORS 또는 프로토콜 문제 | 서버 환경변수 확인 |
| 서버 health 실패 | 서버 다운 | Render 대시보드 확인 |
