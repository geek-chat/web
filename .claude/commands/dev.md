# /dev — 개발 서버 실행

개발 서버를 시작합니다.

## 실행
```bash
npx expo start --web --port 8082
```

## 접속
- http://localhost:8082

## 환경변수
- `EXPO_PUBLIC_API_URL`: 서버 주소 (기본 http://localhost:3000)
- 로컬 개발 시 v1 서버도 함께 실행 필요:
  ```bash
  cd ../geek-chat-server && npm run start:dev
  ```

## 종료
- `Ctrl+C`
