import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;
let currentToken: string | null = null;

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

  socket.on('error', (error: { code: string; message: string }) => {
    console.error('[Socket] Error:', error);
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
 */
export function forceReconnect(): Socket | null {
  if (!currentToken) {
    return null;
  }
  const token = currentToken;
  // 기존 소켓 강제 종료 (listener 보존을 위해 close + open)
  if (socket) {
    socket.disconnect();
    socket = null;
  }
  return connectSocket(token);
}

/**
 * 현재 소켓의 살아있음 여부.
 * socket.connected는 socket.io의 내부 상태 — TCP 레벨 좀비 커넥션은 감지 못 할 수 있다.
 */
export function isSocketAlive(): boolean {
  return socket?.connected === true;
}
