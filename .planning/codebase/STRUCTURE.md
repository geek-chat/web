# Directory Structure

> Generated: 2026-05-08 | Target: geek-chat-web (v1 Expo Web)

## Tree

```
geek-chat-web/
├── app/                          # Expo Router (file-based routing)
│   ├── _layout.tsx               # Root layout — auth hydration, font loading
│   ├── index.tsx                 # Landing/login screen
│   ├── (auth)/                   # Auth group (unauthenticated)
│   │   ├── callback.tsx          # OAuth callback handler
│   │   └── link-account.tsx      # Account linking (linkToken flow)
│   ├── (app)/                    # App group (authenticated)
│   │   ├── _layout.tsx           # App layout — socket init (useChat), auth guard
│   │   ├── rooms.tsx             # Room list + user search + room creation
│   │   ├── chat/[roomId].tsx     # Chat screen — messages, input, read indicators
│   │   └── setup-username.tsx    # Username setup (post-OAuth)
│   └── auth/
│       └── success.tsx           # OAuth success redirect landing
│
├── src/                          # Business logic & UI
│   ├── api/                      # REST API layer (pure HTTP, no state)
│   │   ├── client.ts             # Fetch wrapper — token attach, 401 refresh, retry
│   │   ├── auth.ts               # Auth endpoints (login, signup, OAuth, refresh)
│   │   ├── chat.ts               # Chat endpoints (rooms, messages)
│   │   └── users.ts              # User search endpoint
│   │
│   ├── socket/                   # WebSocket layer (socket.io-client)
│   │   └── socket.ts             # Connect/disconnect, singleton socket instance
│   │
│   ├── store/                    # Zustand stores (global state)
│   │   ├── auth.store.ts         # Auth state — tokens, user, login/logout
│   │   └── chat.store.ts         # Chat state — rooms, messages, optimistic UI
│   │
│   ├── hooks/                    # React hooks (bridge: UI ↔ store/api/socket)
│   │   ├── useAuth.ts            # Auth actions + state
│   │   ├── useChat.ts            # Socket listeners + chat actions
│   │   ├── useChatMessages.ts    # Per-room message helpers
│   │   ├── useRoomList.ts        # Room list + creation
│   │   └── useUserSearch.ts      # Debounced user search
│   │
│   ├── components/               # Pure UI components (props only)
│   │   ├── Avatar.tsx            # User avatar with fallback
│   │   ├── ChatInput.tsx         # Message input bar
│   │   ├── EmptyState.tsx        # Empty list placeholder
│   │   ├── ErrorView.tsx         # Error display
│   │   ├── LoadingSpinner.tsx    # Loading indicator
│   │   ├── MessageBubble.tsx     # Single message bubble
│   │   └── RoomListItem.tsx      # Room list row
│   │
│   ├── theme/                    # Design tokens
│   │   ├── colors.ts             # Color palette (dark mode default)
│   │   ├── spacing.ts            # Spacing, font sizes, border radius
│   │   └── index.ts              # Re-exports
│   │
│   ├── types/                    # Shared TypeScript types
│   │   └── index.ts              # User, Room, Message, MessageResponse
│   │
│   └── utils/                    # Pure utility functions
│       ├── date.ts               # Date formatting (isSameMinute, etc.)
│       └── token.ts              # AsyncStorage token get/set/clear
│
├── test/                         # Tests
│   └── unit/                     # Unit tests (jest-expo)
│       ├── auth.store.test.ts    # Auth store tests
│       ├── date.test.ts          # Date util tests
│       └── token.test.ts         # Token util tests
│
├── CLAUDE.md                     # Project-level Claude instructions
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript config (strict)
├── jest.config.js                # Jest config (jest-expo preset)
├── app.json                      # Expo config
├── vercel.json                   # Vercel SPA rewrites
└── .claude/                      # Claude Code config (see below)
```

## File Counts

| Directory | Files | Purpose |
|---|---|---|
| `app/` | 7 | Routes & layouts |
| `src/api/` | 4 | REST client |
| `src/socket/` | 1 | WebSocket client |
| `src/store/` | 2 | Global state |
| `src/hooks/` | 5 | Logic bridge |
| `src/components/` | 7 | UI components |
| `src/theme/` | 3 | Design tokens |
| `src/types/` | 1 | Type definitions |
| `src/utils/` | 2 | Utilities |
| `test/unit/` | 3 | Unit tests |
| **Total** | **35** | |

## Key Entry Points

| Entry | File | Role |
|---|---|---|
| App root | `app/_layout.tsx` | Auth hydration, font loading |
| Auth guard | `app/(app)/_layout.tsx` | Socket init, auth redirect |
| Main screen | `app/(app)/rooms.tsx` | Room list (post-login landing) |
| Chat screen | `app/(app)/chat/[roomId].tsx` | Message display & sending |
| Login | `app/index.tsx` | Login form + OAuth buttons |
