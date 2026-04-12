import { useEffect, useRef } from 'react';
import { useChatStore } from '../store/chat.store';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useAuthStore } from '../store/auth.store';

export function useChat() {
  const rooms = useChatStore((s) => s.rooms);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);
  const readStatusByRoom = useChatStore((s) => s.readStatusByRoom);
  const loadRooms = useChatStore((s) => s.loadRooms);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const confirmMessage = useChatStore((s) => s.confirmMessage);
  const updateReadStatus = useChatStore((s) => s.updateReadStatus);
  const accessToken = useAuthStore((s) => s.accessToken);

  // ref로 최신 함수 참조 — useEffect 의존성에서 제외하여 재연결 루프 방지
  const handlersRef = useRef({ receiveMessage, confirmMessage, updateReadStatus });
  handlersRef.current = { receiveMessage, confirmMessage, updateReadStatus };

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = connectSocket(accessToken);

    socket.on('new_message', (msg) => {
      handlersRef.current.receiveMessage(msg);
    });

    socket.on('message_ack', (ack: { clientMessageId: string; serverId: string }) => {
      handlersRef.current.confirmMessage(ack.clientMessageId, ack.serverId);
    });

    socket.on('read_update', (data: { roomId: string; userId: string; lastReadAt: string }) => {
      handlersRef.current.updateReadStatus(data.roomId, data.userId, data.lastReadAt);
    });

    return () => {
      const s = getSocket();
      s?.off('new_message');
      s?.off('message_ack');
      s?.off('read_update');
      disconnectSocket();
    };
  }, [accessToken]);

  const markRead = (roomId: string, lastReadMessageId: string) => {
    const socket = getSocket();
    socket?.emit('mark_read', { roomId, lastReadMessageId });
  };

  return { rooms, messagesByRoom, readStatusByRoom, loadRooms, loadMessages, sendMessage, markRead };
}
