# Code Conventions

> Generated: 2026-05-08 | Target: geek-chat-web (v1 Expo Web)

## TypeScript

- **Strict mode**: `tsconfig.json` → `"strict": true`
- **No `any`**: unknown + type guards preferred
- **Props**: Separate `type` or `interface` per component
- **Enums**: Not used — string literal unions instead (`'DIRECT' | 'GROUP'`)

## Naming

| Category | Convention | Example |
|---|---|---|
| Files (general) | kebab-case | `auth.store.ts`, `chat.store.ts` |
| Files (components) | PascalCase | `MessageBubble.tsx`, `Avatar.tsx` |
| Variables/functions | camelCase | `loadRooms`, `sendMessage` |
| Constants | UPPER_SNAKE_CASE | (not heavily used yet) |
| Types/interfaces | PascalCase | `Room`, `Message`, `ChatState` |
| Stores | `use{Name}Store` | `useAuthStore`, `useChatStore` |
| Hooks | `use{Name}` | `useChat`, `useAuth`, `useRoomList` |

## Component Patterns

- **Function components only** — no class components
- **Props-only UI**: Components receive data via props, never import store/api directly
  - Evidence: `MessageBubble.tsx`, `RoomListItem.tsx`, `Avatar.tsx` — all props-driven
- **Hooks for logic**: Business logic extracted to `src/hooks/`
  - Evidence: `useChat.ts` manages socket listeners, `useAuth.ts` wraps store actions

## State Management (Zustand)

- Store definition: `create<State>((set, get) => ({...}))`
- Selector pattern: `useChatStore((s) => s.rooms)` — individual field selectors
- No middleware (no persist, no devtools configured)
- Optimistic updates in `sendMessage` → confirmed via `message_ack`

## Import Rules (Layered Architecture)

```
app/ → hooks/, components/ only (no store/api direct)
hooks/ → store/, api/, socket/
components/ → props only (no store/api/socket)
store/ → api/, socket/
api/, socket/ → no internal imports (pure I/O)
```

Evidence: `app/(app)/chat/[roomId].tsx` imports from `hooks/useAuth`, `store/chat.store`, `components/*`
Note: Some screens (chat/[roomId].tsx) import store directly — minor violation of the layer rule.

## Styling

- `StyleSheet.create()` only — no CSS-in-JS libraries
- Dark mode default — colors from `src/theme/colors.ts`
- Spacing tokens from `src/theme/spacing.ts`
- No responsive breakpoints (mobile-first, single layout)

## Error Handling

- API errors: `throw new Error(`API Error: ${status}`)` — generic
- Socket errors: `console.error('[Socket] Error:', error)` — logged only
- No user-visible error toasts (ErrorView component exists but rarely used)
- Token refresh failure: `clearTokens()` + throw (triggers auth redirect)

## Async Patterns

- `async/await` throughout — no raw `.then()` chains
- No loading state management in stores (no `isLoading` flags)
- No retry logic beyond token refresh
