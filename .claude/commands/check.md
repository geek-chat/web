# /check — 타입 체크 + 테스트

빌드 없이 빠르게 코드 검증합니다.

## 실행
```bash
npx tsc --noEmit && npx jest
```

## 기대 결과
- TypeScript 타입 에러 0개
- Jest 테스트 전체 통과

## 실패 시
1. 타입 에러: `npx tsc --noEmit` 출력에서 파일:라인 확인
2. 테스트 실패: `npx jest --verbose` 로 상세 로그 확인
3. 테스트 파일은 수정하지 않음 — 프로덕션 코드만 수정

## 참고
이 명령은 `.claude/settings.json`의 Stop hook과 동일합니다.
