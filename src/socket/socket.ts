import { io, Socket } from 'socket.io-client';

const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

let socket: Socket | null = null;

export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SERVER_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
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
}
