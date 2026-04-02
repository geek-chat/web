import { useEffect } from 'react';
import { useChatStore } from '../store/chat.store';
import { connectSocket, disconnectSocket, getSocket } from '../socket/socket';
import { useAuthStore } from '../store/auth.store';

export function useChat() {
  const rooms = useChatStore((s) => s.rooms);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);
  const loadRooms = useChatStore((s) => s.loadRooms);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const receiveMessage = useChatStore((s) => s.receiveMessage);
  const confirmMessage = useChatStore((s) => s.confirmMessage);
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const socket = connectSocket(accessToken);

    socket.on('new_message', (msg) => {
      receiveMessage(msg);
    });

    socket.on('message_ack', (ack: { clientMessageId: string; serverId: string }) => {
      confirmMessage(ack.clientMessageId, ack.serverId);
    });

    return () => {
      const s = getSocket();
      s?.off('new_message');
      s?.off('message_ack');
      disconnectSocket();
    };
  }, [accessToken, receiveMessage, confirmMessage]);

  return { rooms, messagesByRoom, loadRooms, loadMessages, sendMessage };
}
