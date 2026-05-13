# Testing

> Generated: 2026-05-08 | Target: geek-chat-web (v1 Expo Web)

## Framework

| Item | Value |
|---|---|
| Runner | Jest via `jest-expo` preset |
| Config | `jest.config.js` |
| Command | `npx jest` (or `npm test`) |
| TS support | via jest-expo transformer |

## Test Files

| File | Tests | Covers |
|---|---|---|
| `test/unit/auth.store.test.ts` | Auth store | login, logout, setUser, token persistence |
| `test/unit/date.test.ts` | Date utils | isSameMinute, formatTime |
| `test/unit/token.test.ts` | Token utils | getAccessToken, setTokens, clearTokens |

## Coverage Map

| Layer | Tested | Notes |
|---|---|---|
| `src/store/auth.store.ts` | ✅ | Core auth flows |
| `src/store/chat.store.ts` | ❌ | **No tests** — optimistic UI, dedup logic untested |
| `src/api/client.ts` | ❌ | **No tests** — token refresh, retry logic untested |
| `src/api/auth.ts` | ❌ | Not tested |
| `src/api/chat.ts` | ❌ | Not tested |
| `src/socket/socket.ts` | ❌ | **No tests** — connection/reconnection untested |
| `src/hooks/*` | ❌ | No hook tests |
| `src/components/*` | ❌ | No component/snapshot tests |
| `src/utils/date.ts` | ✅ | Utility tested |
| `src/utils/token.ts` | ✅ | Utility tested |

## Critical Gaps

1. **chat.store.ts** — Most complex file. Optimistic UI (`sendMessage`), duplicate detection (`receiveMessage`), race condition handling (`confirmMessage`) all untested.
2. **client.ts** — Token refresh queue, 401 retry, concurrent request handling untested.
3. **socket.ts** — Reconnection behavior, connection state management untested.
4. **No integration tests** — No tests for hook+store+api combined flows.
5. **No component tests** — No render tests, no snapshot tests.

## Build Verification

```bash
npx tsc --noEmit          # Type check (configured in .claude/settings.json Stop hook)
npx jest                  # Unit tests (configured in .claude/settings.json Stop hook)
npx expo export --platform web  # Production build
```

## Stop Hook

`.claude/settings.json` runs `npx tsc --noEmit && npx jest` on every Stop — ensures no type errors or test failures before committing.
