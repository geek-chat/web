# Architecture

**Analysis Date:** 2026-05-08

## Pattern Overview

**Overall:** Layered Client Architecture (Expo Web / React Native for Web)

**Key Characteristics:**
- Strict unidirectional data flow: app/ (routes) -> hooks/ (logic) -> store/ (state) -> api/ + socket/ (communication)
- Components are pure UI: receive data via props only, no direct store/api access
- Optimistic UI pattern for real-time messaging with clientMessageId-based deduplication
- OAuth-based authentication with JWT token rotation and AsyncStorage persistence
- Socket.io for real-time events (new_message, message_ack, read_update)

## Layers

**Routing Layer (app/):**
- Purpose: File-based routing via Expo Router, screen-level composition
- Location: `app/`
- Contains: Screen components that wire hooks to UI components
- Depends on: hooks/, components/, store/ (auth guard only)
- Used by: Expo Router (automatic)
- Rules: May import hooks and components. Must NOT import api/ or socket/ directly.
- Exception: `app/(app)/chat/[roomId].tsx` (lines 6, 19-20) directly imports `useChatStore` and `getSocket` — this violates the stated convention but is the current implementation.

**Hooks Layer (src/hooks/):**
- Purpose: Business logic orchestration, bridging stores with screen needs
- Location: `src/hooks/`
- Contains: Custom React hooks (useAuth, useChat, useRoomList, useChatMessages, useUserSearch)
- Depends on: store/, api/, socket/
- Used by: app/ (route screens)
- Rules: May import store, api, socket. Must NOT import components.

**Store Layer (src/store/):**
- Purpose: Global state management via Zustand
- Location: `src/store/`
- Contains: Two stores — `auth.store.ts` (authentication state) and `chat.store.ts` (rooms, messages, read status)
- Depends on: api/, socket/, utils/
- Used by: hooks/, app/ (auth guards)
- Rules: May import api, socket. Must NOT import components or hooks.

**API Layer (src/api/):**
- Purpose: REST API communication with automatic token management
- Location: `src/api/`
- Contains: `client.ts` (shared fetch wrapper), `auth.ts`, `chat.ts`, `users.ts`
- Depends on: utils/token.ts (for auth headers)
- Used by: store/, hooks/
- Rules: Pure communication layer. No external dependencies beyond token utils.

**Socket Layer (src/socket/):**
- Purpose: Real-time WebSocket communication via socket.io-client
- Location: `src/socket/`
- Contains: `socket.ts` (singleton socket connection manager)
- Depends on: None (receives token as parameter)
- Used by: hooks/useChat.ts, store/chat.store.ts
- Rules: Pure communication layer. Singleton pattern — one socket instance.

**Components Layer (src/components/):**
- Purpose: Reusable UI components (pure/presentational)
- Location: `src/components/`
- Contains: MessageBubble, ChatInput, RoomListItem, Avatar, LoadingSpinner, ErrorView, EmptyState
- Depends on: src/theme/ (colors, spacing), src/types/ (type definitions), src/utils/date.ts
- Used by: app/ (route screens)
- Rules: Props-only. Must NOT import store, api, or socket directly.

**Theme Layer (src/theme/):**
- Purpose: Centralized design tokens (colors, spacing, font sizes, border radii)
- Location: `src/theme/`
- Contains: `colors.ts`, `spacing.ts`, `index.ts` (barrel export)
- Depends on: Nothing
- Used by: All layers (components, app screens)

**Types Layer (src/types/):**
- Purpose: Shared TypeScript type definitions
- Location: `src/types/`
- Contains: `index.ts` — User, Room, RoomMember, Message, MessageResponse, MessageStatus
- Depends on: Nothing
- Used by: All layers

**Utils Layer (src/utils/):**
- Purpose: Pure utility functions
- Location: `src/utils/`
- Contains: `token.ts` (AsyncStorage token CRUD), `date.ts` (time formatting/comparison)
- Depends on: `@react-native-async-storage/async-storage`
- Used by: api/client.ts, store/auth.store.ts, components/

## Data Flow

**Message Sending (Optimistic UI):**

1. User types message, presses send in `app/(app)/chat/[roomId].tsx` line 77-82
2. `handleSend` calls `sendMessage(roomId, content, user.id)` on chat store
3. `chat.store.ts` line 88-109: generates `clientMessageId` (UUID v4), creates pending Message with `status: 'pending'`, prepends to room messages array
4. `chat.store.ts` line 108-109: emits `send_message` via socket.io with `{ roomId, content, clientMessageId }`
5. UI immediately renders the pending message (optimistic)
6. Server responds with `message_ack` event: `{ clientMessageId, serverId }`
7. `useChat.ts` line 33-35: receives ack, calls `confirmMessage(clientMessageId, serverId)`
8. `chat.store.ts` line 139-161: finds pending message by clientMessageId, updates `id` to serverId, sets `status: 'confirmed'`. Handles race condition where `new_message` arrives before `message_ack`.

**Message Receiving:**

1. Server broadcasts `new_message` to all room members
2. `useChat.ts` line 29-31: receives event, calls `receiveMessage(msg)`
3. `chat.store.ts` line 112-137: checks for duplicates by server ID and clientMessageId, prepends to room messages if new
4. `chat.store.ts` line 116-118: deduplication — skips if `m.id === msg.id` (same server ID) or `m.clientMessageId === msg.id` (sender's pending message)

**Read Status Flow:**

1. User enters chat room or new messages arrive: `app/(app)/chat/[roomId].tsx` lines 66-75
2. Emits `mark_read` with `{ roomId, lastReadMessageId }` to server
3. Server broadcasts `read_update` to room members
4. `useChat.ts` line 37-39: receives `read_update`, calls `updateReadStatus(roomId, userId, lastReadAt)`
5. `chat.store.ts` line 163-173: updates `readStatusByRoom[roomId][userId]`
6. Chat screen renders "read" indicator based on `otherReadAt` comparison (line 93)

**Authentication Flow (OAuth):**

1. User clicks OAuth button on `app/index.tsx` line 33-38 — redirects to server OAuth endpoint
2. Server redirects back to `app/auth/success.tsx` with tokens in URL hash
3. `auth/success.tsx` lines 12-42: parses hash params, handles three cases:
   - Normal login: calls `login()` with tokens, navigates to rooms
   - Account linking required (`linking_required=true`): navigates to `/(auth)/link-account`
   - Missing tokens: navigates back to login
4. `auth.store.ts` line 25-28: `login()` persists tokens via AsyncStorage, sets `isAuthenticated: true`

**Token Refresh Flow:**

1. `api/client.ts` line 61: detects 401 response on any API call
2. `api/client.ts` lines 88-107: `handleTokenRefresh()` — mutex-based refresh (prevents concurrent refresh calls)
3. `api/client.ts` lines 21-39: `refreshAccessToken()` — calls `/auth/refresh`, stores new token pair
4. Original request retried with new access token (line 66-73)
5. On refresh failure: clears tokens, throws 'Session expired' (line 77-78)

**State Management:**

- **Library:** Zustand (lightweight, no providers/context needed)
- **Stores:** 2 total
  - `useAuthStore` (`src/store/auth.store.ts`): accessToken, refreshToken, user, isAuthenticated, isHydrated
  - `useChatStore` (`src/store/chat.store.ts`): rooms, messagesByRoom (Record<roomId, Message[]>), readStatusByRoom
- **Persistence:** Manual via AsyncStorage (tokens only). No zustand-persist middleware.
- **Hydration:** `restoreAuth()` called in root layout (`app/_layout.tsx` line 13-15), sets `isHydrated` flag to control splash screen

## Key Abstractions

**apiClient (Generic Fetch Wrapper):**
- Purpose: Centralized HTTP client with automatic auth headers and token refresh
- Location: `src/api/client.ts` line 42-86
- Pattern: Generic function `apiClient<T>(path, options): Promise<T>`. Auto-attaches Bearer token, handles 401 with refresh retry, JSON parsing.

**Socket Singleton:**
- Purpose: Single socket.io connection shared across the app
- Location: `src/socket/socket.ts`
- Pattern: Module-level `let socket: Socket | null`. `connectSocket(token)` creates/reuses, `getSocket()` returns current, `disconnectSocket()` cleans up.
- Connection config: WebSocket transport only, auto-reconnect with 10 attempts, exponential backoff 1-10s

**Message Status State Machine:**
- States: `'pending'` -> `'confirmed'` | `'failed'`
- Defined in: `src/types/index.ts` line 31
- Transitions managed by: `chat.store.ts` (sendMessage creates pending, confirmMessage transitions to confirmed)

## Entry Points

**Root Layout:**
- Location: `app/_layout.tsx`
- Triggers: App startup (Expo Router)
- Responsibilities: Auth hydration from AsyncStorage, loading screen while hydrating, Stack navigator setup with dark theme

**App Layout (Auth Guard):**
- Location: `app/(app)/_layout.tsx`
- Triggers: Navigation to any `(app)/` route
- Responsibilities: Redirects to `/` if not authenticated, initializes socket connection via `useChat()`, fetches user profile via `getMe()`, redirects to username setup if missing

**Login Screen:**
- Location: `app/index.tsx`
- Triggers: App start when not authenticated
- Responsibilities: OAuth login buttons (Google, Naver), redirect to rooms if already authenticated

## Error Handling

**Strategy:** Try-catch with user-facing error messages (Korean), silent fallbacks for non-critical failures

**Patterns:**
- API errors: `apiClient` throws `Error` with status code. Callers catch and display Korean error messages.
- Auth errors: 401 triggers auto-refresh. Refresh failure clears tokens silently (user sees login screen).
- Socket errors: Logged to console (`[Socket] Error:`). Auto-reconnect handles transient failures.
- Server logout failure: Silently ignored — local state always cleared (`auth.store.ts` line 37)
- OAuth errors: Error codes mapped to Korean messages via `ERROR_MESSAGES` dict (`app/index.tsx` lines 9-13)

## Cross-Cutting Concerns

**Logging:** Console-only. Socket events logged with `[Socket]` prefix (`src/socket/socket.ts` lines 28-38). No structured logging framework.

**Validation:** Client-side only. Username validation via regex pattern `/^[a-z0-9_]{3,20}$/` (`app/(app)/setup-username.tsx` line 8). Search query minimum 2 chars (`src/hooks/useUserSearch.ts` line 14).

**Authentication:** JWT Bearer tokens. Access token auto-attached to all REST requests. Socket authenticated via `auth: { token }` in connection options. Tokens persisted in AsyncStorage under keys `geek_chat_access_token` / `geek_chat_refresh_token` (`src/utils/token.ts` lines 3-4).

**Styling:** React Native `StyleSheet.create()`. Dark mode only. All colors from `src/theme/colors.ts`. Spacing/sizing from `src/theme/spacing.ts`.

---

*Architecture analysis: 2026-05-08*
