# Theme 계층

## 역할
디자인 토큰 중앙 관리. 모든 StyleSheet에서 이 모듈의 상수를 사용한다.

## 파일
| 파일 | 내용 |
|---|---|
| colors.ts | 색상 팔레트 (bg, text, accent, bubble, border, status) |
| spacing.ts | 간격(spacing), 폰트 크기(fontSize), 둥글기(borderRadius) |
| index.ts | 배럴 export |

## 사용법
```typescript
import { colors, spacing, fontSize, borderRadius } from '../theme';
```

## 규칙
- 하드코딩된 색상 코드(#xxx) 사용 금지. 반드시 colors.* 사용.
- 하드코딩된 간격/폰트 크기도 가능하면 spacing.*/fontSize.* 사용.
