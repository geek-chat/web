import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { useChatStore } from '../store/chat.store';
import { connectSocket, disconnectSocket, getSocket, forceReconnect } from '../socket/socket';
import { useAuthStore } from '../store/auth.store';

export function useChat() {
  const rooms = useChatStore((s) => s.rooms);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);
  const readStatusByRoom = useChatStore((s) => s.readStatusByRoom);
  const isConnected = useChatStore((s) => s.isConnected);
  const loadRooms = useChatStore((s) => s.loadRooms);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const confirmMessage = useChatStore((s) => s.confirmMessage);
  const updateReadStatus = useChatStore((s) => s.updateReadStatus);
  const syncAllRoomsAfterReconnect = useChatStore((s) => s.syncAllRoomsAfterReconnect);
  const setConnected = useChatStore((s) => s.setConnected);
  const accessToken = useAuthStore((s) => s.accessToken);

  // ref로 최신 함수 참조 — useEffect 의존성에서 제외하여 재연결 루프 방지
  const handlersRef = useRef({
    receiveMessage,
    confirmMessage,
    updateReadStatus,
    syncAllRoomsAfterReconnect,
    setConnected,
  });
  handlersRef.current = {
    receiveMessage,
    confirmMessage,
    updateReadStatus,
    syncAllRoomsAfterReconnect,
    setConnected,
  };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = connectSocket(accessToken);

    // ── 연결 상태 추적 ──────────────────────────────
    const onConnect = () => {
      handlersRef.current.setConnected(true);
      // 재연결 시 누락 메시지 일괄 동기화 (초기 연결 시에도 안전 — 이미 최신이면 no-op)
      handlersRef.current.syncAllRoomsAfterReconnect();
    };
    const onDisconnect = () => {
      handlersRef.current.setConnected(false);
    };
    // 현재 상태 반영 (이미 연결돼 있다면 즉시 true)
    if (socket.connected) {
      handlersRef.current.setConnected(true);
    }
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    // ── 도메인 이벤트 ──────────────────────────────
    socket.on('new_message', (msg) => {
      handlersRef.current.receiveMessage(msg);
    });

    socket.on('message_ack', (ack: { clientMessageId: string; serverId: string }) => {
      handlersRef.current.confirmMessage(ack.clientMessageId, ack.serverId);
    });

    socket.on('read_update', (data: { roomId: string; userId: string; lastReadAt: string }) => {
      handlersRef.current.updateReadStatus(data.roomId, data.userId, data.lastReadAt);
    });

    // ── 좀비 커넥션 복구 ──────────────────────────
    // socket.io의 자동 재연결로도 못 잡는 경우(브라우저 sleep, 네트워크 스위치 등) 대응.
    // 탭이 다시 보일 때 / 네트워크가 돌아올 때 강제 재연결.
    const checkAndReconnect = () => {
      const s = getSocket();
      if (s && !s.connected) {
        console.log('[Socket] Stale connection detected → force reconnect');
        forceReconnect();
      }
    };

    let visibilityHandler: (() => void) | null = null;
    let onlineHandler: (() => void) | null = null;
    let focusHandler: (() => void) | null = null;

    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      visibilityHandler = () => {
        if (document.visibilityState === 'visible') {
          checkAndReconnect();
        }
      };
      onlineHandler = () => {
        checkAndReconnect();
      };
      focusHandler = () => {
        checkAndReconnect();
      };
      document.addEventListener('visibilitychange', visibilityHandler);
      window.addEventListener('online', onlineHandler);
      window.addEventListener('focus', focusHandler);
    }

    return () => {
      const s = getSocket();
      s?.off('connect', onConnect);
      s?.off('disconnect', onDisconnect);
      s?.off('new_message');
      s?.off('message_ack');
      s?.off('read_update');

      if (Platform.OS === 'web' && typeof document !== 'undefined') {
        if (visibilityHandler) {
          document.removeEventListener('visibilitychange', visibilityHandler);
        }
        if (onlineHandler) {
          window.removeEventListener('online', onlineHandler);
        }
        if (focusHandler) {
          window.removeEventListener('focus', focusHandler);
        }
      }

      disconnectSocket();
    };
  }, [accessToken]);

  const markRead = useCallback((roomId: string, lastReadMessageId: string) => {
    const socket = getSocket();
    socket?.emit('mark_read', { roomId, lastReadMessageId });
  }, []);

  /** 수동 재연결 — UI 배너 또는 채팅 화면 진입 시 호출 */
  const reconnect = useCallback(() => {
    const s = getSocket();
    if (s && !s.connected) {
      console.log('[Socket] Manual reconnect requested');
      forceReconnect();
    }
  }, []);

  return {
    rooms,
    messagesByRoom,
    readStatusByRoom,
    isConnected,
    loadRooms,
    loadMessages,
    sendMessage,
    markRead,
    reconnect,
  };
}
