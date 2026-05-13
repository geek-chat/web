# External Integrations

**Analysis Date:** 2026-05-08

## APIs & External Services

**GeekChat Backend (NestJS v1):**
- Base URL configured via `EXPO_PUBLIC_API_URL` env var
- Default: `http://localhost:3000` (`src/api/client.ts` line 3)
- Production: `https://geek-chat-server.onrender.com` (per `CLAUDE.md`)
- Client: Custom fetch wrapper at `src/api/client.ts`
- Auth: Bearer token auto-attached via `apiClient()` (line 52)
- Auto 401 refresh: Built-in token refresh with request queuing (lines 61-78, 88-106)

**REST Endpoints Used:**

| Endpoint | Method | File | Purpose |
|---|---|---|---|
| `/auth/refresh` | POST | `src/api/client.ts:27` | Token refresh |
| `/auth/me` | GET | `src/api/auth.ts:22` | Current user info |
| `/auth/link-provider` | POST | `src/api/auth.ts:26` | OAuth account linking |
| `/auth/logout` | POST | `src/api/auth.ts:39` | Server-side logout |
| `/api/rooms` | GET | `src/api/chat.ts:13` | List rooms |
| `/api/rooms` | POST | `src/api/chat.ts:17` | Create room |
| `/api/rooms/:id/messages` | GET | `src/api/chat.ts:23` | Fetch messages (cursor pagination) |
| `/api/users/search?q=X` | GET | `src/api/users.ts:11` | User search |
| `/api/users/me/username` | PATCH | `src/api/users.ts:19` | Set username |

## WebSocket (Socket.io)

**Connection:**
- URL: Same as `EXPO_PUBLIC_API_URL` (`src/socket/socket.ts` line 3)
- Library: `socket.io-client` 4.8.3
- Transport: WebSocket only (`transports: ['websocket']`, line 19)
- Auth: Token passed via `auth: { token }` object (line 18)

**Connection Config** (`src/socket/socket.ts` lines 17-26):
- `autoConnect: true`
- `reconnection: true`
- `reconnectionDelay: 1000ms`
- `reconnectionDelayMax: 10000ms`
- `reconnectionAttempts: 10`
- `randomizationFactor: 0.5`

**Events Emitted (Client -> Server):**
- `send_message` - `{ roomId, content, clientMessageId }` (`src/store/chat.store.ts` line 109)
- `typing_start` - Typing indicator (`src/hooks/useChat.ts` - if implemented)
- `mark_read` - Read receipt (`src/hooks/useChatMessages.ts` - if implemented)

**Events Listened (Server -> Client):**
- `message_ack` - Message delivery confirmation (handled in `src/hooks/useChat.ts`)
- `new_message` - Incoming messages from other users (handled in `src/hooks/useChat.ts`)
- `read_update` - Read status updates (handled in `src/hooks/useChat.ts`)
- `typing_indicator` - Other user typing (handled in `src/hooks/useChatMessages.ts`)
- `error` - Server error events (`src/socket/socket.ts` line 36)
- `connect` - Connection established (`src/socket/socket.ts` line 28)
- `disconnect` - Connection lost (`src/socket/socket.ts` line 32)

**Singleton Pattern:**
- Single socket instance managed via module-level variable (`src/socket/socket.ts` line 5)
- `connectSocket(token)` - Creates or reuses connection
- `getSocket()` - Returns current instance
- `disconnectSocket()` - Tears down connection

## Data Storage

**Client-Side Persistence:**
- `@react-native-async-storage/async-storage` 2.2.0
- Used exclusively for JWT token storage (`src/utils/token.ts`)
- Storage keys: `geek_chat_access_token`, `geek_chat_refresh_token` (lines 3-4)
- On web: Uses `localStorage` under the hood

**In-Memory State:**
- Zustand stores (not persisted across sessions):
  - `src/store/auth.store.ts` - Auth state (tokens, user, isAuthenticated, isHydrated)
  - `src/store/chat.store.ts` - Chat state (rooms, messagesByRoom, readStatusByRoom)

**Databases:**
- None (client-side app - all data from backend API)

**File Storage:**
- None (no file upload functionality detected)

**Caching:**
- None (no explicit caching layer; Zustand stores serve as runtime cache)

## Authentication & Identity

**Auth Flow:**
- JWT-based authentication
- Access Token + Refresh Token pair
- Tokens stored in AsyncStorage (`src/utils/token.ts`)

**Token Management:**
- `setTokens(access, refresh)` - Store both tokens (`src/utils/token.ts` line 14)
- `getAccessToken()` / `getRefreshToken()` - Retrieve tokens (lines 6, 10)
- `clearTokens()` - Remove both on logout (line 18)

**Auth Restore on App Start:**
- `restoreAuth()` in `src/store/auth.store.ts` lines 46-54
- Reads tokens from AsyncStorage, sets `isAuthenticated` + `isHydrated`
- Called from app root layout to determine initial route

**OAuth Providers:**
- Google - Server-initiated flow via `/auth/google` redirect
- Naver - Server-initiated flow via `/auth/naver` redirect
- OAuth callback handled at `app/(auth)/callback.tsx`
- Tokens received via URL hash fragment (`#access_token=...&refresh_token=...`)

**Account Linking:**
- When OAuth email matches existing account with different provider
- Server issues `linkToken` (temporary JWT, 10min TTL)
- User decides via `app/(auth)/link-account.tsx`
- `linkProvider(linkToken, confirm)` API call (`src/api/auth.ts` line 26)

**Auto-Refresh:**
- On 401 response, `apiClient` automatically attempts token refresh (`src/api/client.ts` lines 61-78)
- Concurrent requests queue behind a single refresh attempt (lines 88-106)
- Failed refresh clears tokens and throws "Session expired"

## Monitoring & Observability

**Error Tracking:**
- None (no Sentry, Bugsnag, or similar SDK detected)

**Logs:**
- `console.log` / `console.error` only
- Socket events logged: connect, disconnect, error (`src/socket/socket.ts` lines 28-38)

## CI/CD & Deployment

**Hosting:**
- Vercel (static SPA deployment)
- `vercel.json` configures SPA fallback: all routes rewrite to `/index.html`

**Build Command:**
- `npx expo export --platform web` produces `dist/` folder

**CI Pipeline:**
- Not detected (no `.github/workflows/`, no CI config files found)

## Environment Configuration

**Required env vars:**
- `EXPO_PUBLIC_API_URL` - Backend API base URL (used in `src/api/client.ts`, `src/socket/socket.ts`)

**Optional env vars:**
- None detected beyond the API URL

**Secrets location:**
- `.env` file present at project root (not committed to git)
- No other secret files detected

## Webhooks & Callbacks

**Incoming:**
- `app/(auth)/callback.tsx` - OAuth callback receiver
  - Parses tokens from URL hash fragment
  - Routes: `/(auth)/callback`
- `app/auth/success.tsx` - OAuth success page
  - Route: `/auth/success`

**Outgoing:**
- None (all communication is request-response via REST or Socket.io events)

---

*Integration audit: 2026-05-08*
