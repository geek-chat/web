import { useCallback } from 'react';
import { useChatStore } from '../store/chat.store';

export function useChatMessages(roomId: string) {
  const messages = useChatStore((s) => s.messagesByRoom[roomId] || []);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const loadMessages = useChatStore((s) => s.loadMessages);

  const send = useCallback(
    (content: string, senderId: string) => {
      sendMessage(roomId, content, senderId);
    },
    [roomId, sendMessage],
  );

  const load = useCallback(
    (cursor?: string) => {
      loadMessages(roomId, cursor);
    },
    [roomId, loadMessages],
  );

  return { messages, send, loadMessages: load };
}
