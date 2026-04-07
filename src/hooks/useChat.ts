import { useEffect } from 'react';
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

    socket.on('read_update', (data: { roomId: string; userId: string; lastReadAt: string }) => {
      updateReadStatus(data.roomId, data.userId, data.lastReadAt);
    });

    return () => {
      const s = getSocket();
      s?.off('new_message');
      s?.off('message_ack');
      s?.off('read_update');
      disconnectSocket();
    };
  }, [accessToken, receiveMessage, confirmMessage, updateReadStatus]);

  const markRead = (roomId: string, lastReadMessageId: string) => {
    const socket = getSocket();
    socket?.emit('mark_read', { roomId, lastReadMessageId });
  };

  return { rooms, messagesByRoom, readStatusByRoom, loadRooms, loadMessages, sendMessage, markRead };
}
