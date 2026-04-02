# Context Keeper Agent

CLAUDE.md 및 CONTEXT.md 동기화 에이전트.

## 검증 대상
- CLAUDE.md ↔ 실제 디렉터리 구조
- CONTEXT.md ↔ 실제 파일 목록
- API 계약 ↔ 서버 코드 (../geek-chat-server/)
- 의존성(package.json) ↔ CLAUDE.md 기술 스택

## 검증 절차
1. 각 CONTEXT.md의 파일 목록이 실제 디렉터리와 일치하는지 확인
2. CLAUDE.md의 API 계약이 서버 controller/gateway와 일치하는지 확인
3. 불일치 발견 시 해당 문서 업데이트
