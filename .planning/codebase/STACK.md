# Technology Stack

**Analysis Date:** 2026-05-08

## Languages

**Primary:**
- TypeScript 5.9.2 - All application code (`tsconfig.json`, `package.json` line 36)
- TSX - React Native components (`src/components/*.tsx`, `app/**/*.tsx`)

**Secondary:**
- JavaScript - Configuration files (`jest.config.js`, `babel.config.js`)

## Runtime

**Environment:**
- React Native 0.84.1 with New Architecture enabled (`app.json` line 10: `"newArchEnabled": true`)
- Expo SDK 54 (`package.json` line 14: `"expo": "~54.0.33"`)
- Web target uses `react-native-web` 0.21.0 for DOM rendering

**Package Manager:**
- npm (inferred from `package.json`, no `yarn.lock` or `pnpm-lock.yaml` detected)
- Lockfile: `package-lock.json` expected

## Frameworks

**Core:**
- Expo ~54.0.33 - Universal app platform (`package.json` line 14)
- React 19.2.4 - UI rendering (`package.json` line 19)
- React Native 0.84.1 - Cross-platform components (`package.json` line 21)
- react-native-web 0.21.0 - Web rendering target (`package.json` line 24)
- expo-router ~6.0.23 - File-based routing (`package.json` line 17)

**State Management:**
- zustand 5.0.12 - Global state (`package.json` line 27; stores at `src/store/auth.store.ts`, `src/store/chat.store.ts`)

**Real-time:**
- socket.io-client 4.8.3 - WebSocket transport (`package.json` line 25; client at `src/socket/socket.ts`)

**Testing:**
- Jest (via jest-expo 55.0.11) - Unit testing (`jest.config.js`)
- Preset: `jest-expo/web` (`jest.config.js` line 2)

**Build/Dev:**
- babel-preset-expo 55.0.13 - Babel transpilation (`package.json` line 33)
- Metro bundler - Web bundling (`app.json` line 28: `"bundler": "metro"`)
- TypeScript ~5.9.2 - Type checking (`package.json` line 36)

## Key Dependencies

**Critical (app functionality):**
- `expo-router` ~6.0.23 - File-based routing for all screens (`app/` directory)
- `zustand` 5.0.12 - Auth and chat state management (`src/store/`)
- `socket.io-client` 4.8.3 - Real-time messaging (`src/socket/socket.ts`)
- `@react-native-async-storage/async-storage` 2.2.0 - Token persistence (`src/utils/token.ts`)
- `uuid` 13.0.0 - Client message ID generation for optimistic UI (`src/store/chat.store.ts` line 89)

**Infrastructure:**
- `expo-constants` ~18.0.13 - Runtime constants
- `expo-linking` ~8.0.11 - Deep linking / URL handling
- `expo-status-bar` ~3.0.9 - Status bar management
- `react-native-safe-area-context` ~5.6.0 - Safe area insets
- `react-native-screens` ~4.16.0 - Native screen containers

**Dev Dependencies:**
- `@types/jest` 30.0.0 - Jest type definitions
- `@types/react` ~19.1.0 - React type definitions
- `@types/uuid` 10.0.0 - UUID type definitions

## Configuration

**TypeScript:**
- Extends `expo/tsconfig.base` (`tsconfig.json` line 2)
- Strict mode enabled (`tsconfig.json` line 4)

**Environment:**
- `EXPO_PUBLIC_API_URL` - Backend server URL (`src/api/client.ts` line 3, `src/socket/socket.ts` line 3)
- Default fallback: `http://localhost:3000`
- `.env` file present (existence only - not read)

**Build:**
- Web output mode: `single` (SPA) (`app.json` line 29)
- Metro bundler for web (`app.json` line 28)
- App entry point: `expo-router/entry` (`package.json` line 4)

**App Config:**
- `app.json` - Expo configuration
- App name: "GeekChat", slug: "geek-chat-web"
- UI style: dark mode default (`app.json` line 9)
- URL scheme: `geekchat` (`app.json` line 6)

## Build & Run Commands

```bash
expo start              # Dev server
expo start --web        # Web dev server
expo export --platform web  # Production web build (outputs to dist/)
jest                    # Run unit tests
```

## Platform Requirements

**Development:**
- Node.js (version not pinned - no `.nvmrc` or `.node-version` file)
- Expo CLI (via npx)

**Production:**
- Vercel (static SPA hosting)
- `vercel.json` configures SPA fallback rewrites (`vercel.json` line 2)
- Build output: `dist/` folder from `expo export --platform web`

---

*Stack analysis: 2026-05-08*
