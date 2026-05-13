import { io, Socket } from 'socket.io-client';
import { refreshTokens } from '../api/auth';
import { getRefreshToken } from '../utils/token';
import { useAuthStore } from '../store/auth.store';

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;
let currentToken: string | null = null;
/** 토큰 refresh가 진행 중인지 — 동시 다발적 refresh 시도 방지 */
let isRefreshing = false;

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  // 이미 소켓이 있고 연결 시도 중이면 재사용
  if (socket && !socket.disconnected) {
    return socket;
  }

  currentToken = token;
  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
    reconnectionAttempts: Infinity,
    randomizationFactor: 0.5,
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
  });

  // 서버가 명시적으로 보낸 error 이벤트 (app-level)
  socket.on('error', (error: { code?: string; message?: string }) => {
    console.error('[Socket] Error:', error);
    if (isTokenExpiredError(error)) {
      // useAuthStore.login()을 호출해서 useChat의 accessToken dependency를 트리거 →
      // useChat의 useEffect가 자동으로 disconnect + 새 토큰으로 reconnect.
      void tryRefreshAuth();
    }
  });

  // socket.io connection 단계의 에러 (handshake 실패 등)
  socket.on('connect_error', (err) => {
    console.error('[Socket] Connect error:', err.message);
    if (isTokenExpiredError({ message: err.message })) {
      void tryRefreshAuth();
    }
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
  currentToken = null;
}

/**
 * 좀비 커넥션(서버가 끊었는데 클라이언트가 모르는 상태) 복구용.
 * 기존 소켓을 강제 종료하고 새로 생성한다.
 *
 * 사용 시점:
 * - 탭이 다시 활성화됐는데 socket.connected === false
 * - 네트워크가 돌아왔는데 자동 재연결이 안 됨
 * - 사용자가 "다시 연결" 버튼을 누름
 * - sendMessage 직전에 소켓이 죽어있는 게 감지됨
 */
export function forceReconnect(): Socket | null {
  if (!currentToken) {
    return null;
  }
  const token = currentToken;
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return connectSocket(token);
}

/**
 * 현재 소켓의 살아있음 여부.
 * 주의: socket.connected는 클라이언트의 마지막 인지 상태일 뿐,
 * 실제 TCP 연결 상태가 아니다. 좀비 커넥션은 별도 트리거(visibilitychange 등)로 감지.
 */
export function isSocketAlive(): boolean {
  return socket?.connected === true;
}

/**
 * 토큰 만료 에러 패턴 매칭.
 * v1 서버는 다음 두 형태 중 하나로 토큰 만료를 알린다:
 * - { code: 'TOKEN_EXPIRED', message: 'Token expired' }
 * - { code: 'AUTH_ERROR', message: '... expired ...' }
 */
function isTokenExpiredError(error: { code?: string; message?: string }): boolean {
  if (error.code === 'TOKEN_EXPIRED') {
    return true;
  }
  if (error.code === 'INVALID_TOKEN') {
    // INVALID_TOKEN은 보통 위조 — refresh 대상이 아니지만 만료된 토큰이 변조처럼 보일 수 있어 시도
    return true;
  }
  if (error.message?.toLowerCase().includes('expired')) {
    return true;
  }
  return false;
}

/**
 * refresh token으로 새 access token을 받고 auth store를 갱신한다.
 * auth store 갱신 → useChat의 accessToken dependency 트리거 → 자동 재연결.
 *
 * 동시 refresh 방지: isRefreshing 플래그로 lock.
 */
async function tryRefreshAuth(): Promise<void> {
  if (isRefreshing) {
    return;
  }
  isRefreshing = true;
  try {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) {
      console.warn('[Socket] No refresh token — user needs to re-login');
      await useAuthStore.getState().logout();
      return;
    }
    console.log('[Socket] Refreshing access token...');
    const newTokens = await refreshTokens(refreshToken);
    await useAuthStore.getState().login(newTokens);
    console.log('[Socket] Token refreshed — reconnection will be triggered by useChat');
  } catch (e) {
    console.error('[Socket] Token refresh failed — logging out:', e);
    await useAuthStore.getState().logout();
  } finally {
    isRefreshing = false;
  }
}
