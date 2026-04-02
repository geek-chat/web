# 빌드/테스트/검증

1. `npx tsc --noEmit` → 타입 에러 0개
2. `npx expo export --platform web` → 빌드 성공
3. `npx expo start --web` → 개발 서버 실행 확인
4. 브라우저에서 http://localhost:8081 접속 확인
5. 3회 실패 시 사용자에게 보고
