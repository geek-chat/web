import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getSocket } from '../socket/socket';
import { getRooms as fetchRooms, getMessages as fetchMessages } from '../api/chat';
import type { Room, MessageResponse } from '../api/chat';

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname?: string;
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
  status: 'pending' | 'confirmed' | 'failed';
  clientMessageId: string;
};

type ChatState = {
  rooms: Room[];
  messagesByRoom: Record<string, Message[]>;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string, cursor?: string) => Promise<void>;
  sendMessage: (roomId: string, content: string, senderId: string) => void;
  receiveMessage: (msg: {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    type: 'TEXT' | 'SYSTEM';
    createdAt: string;
  }) => void;
  confirmMessage: (clientMessageId: string, serverId: string) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  messagesByRoom: {},

  loadRooms: async () => {
    const rooms = await fetchRooms();
    set({ rooms });
  },

  loadMessages: async (roomId, cursor) => {
    const responses = await fetchMessages(roomId, {
      cursor,
      direction: 'backward',
    });
    const messages: Message[] = responses.map((m: MessageResponse) => ({
      id: m.id,
      roomId,
      senderId: m.senderId,
      senderNickname: m.senderNickname,
      content: m.content,
      type: m.type,
      createdAt: m.createdAt,
      status: 'confirmed' as const,
      clientMessageId: m.id,
    }));

    set((state) => {
      const existing = state.messagesByRoom[roomId] || [];
      if (cursor) {
        // 이전 메시지 로드 (위로 스크롤)
        const existingIds = new Set(existing.map((m) => m.id));
        const newMessages = messages.filter((m) => !existingIds.has(m.id));
        return {
          messagesByRoom: {
            ...state.messagesByRoom,
            [roomId]: [...newMessages, ...existing],
          },
        };
      }
      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: messages,
        },
      };
    });
  },

  sendMessage: (roomId, content, senderId) => {
    const clientMessageId = uuidv4();
    const pendingMessage: Message = {
      id: clientMessageId,
      roomId,
      senderId,
      content,
      type: 'TEXT',
      createdAt: new Date().toISOString(),
      status: 'pending',
      clientMessageId,
    };

    set((state) => ({
      messagesByRoom: {
        ...state.messagesByRoom,
        [roomId]: [...(state.messagesByRoom[roomId] || []), pendingMessage],
      },
    }));

    const socket = getSocket();
    socket?.emit('send_message', { roomId, content, clientMessageId });
  },

  receiveMessage: (msg) => {
    set((state) => {
      const roomMessages = state.messagesByRoom[msg.roomId] || [];
      // clientMessageId 기반 중복 방지
      const isDuplicate = roomMessages.some(
        (m) => m.id === msg.id || (m.status === 'confirmed' && m.id === msg.id),
      );
      if (isDuplicate) {
        return state;
      }

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [msg.roomId]: [
            ...roomMessages,
            {
              ...msg,
              status: 'confirmed' as const,
              clientMessageId: msg.id,
            },
          ],
        },
      };
    });
  },

  confirmMessage: (clientMessageId, serverId) => {
    set((state) => {
      const newMessagesByRoom = { ...state.messagesByRoom };
      for (const roomId of Object.keys(newMessagesByRoom)) {
        const messages = newMessagesByRoom[roomId];
        const idx = messages.findIndex((m) => m.clientMessageId === clientMessageId);
        if (idx !== -1) {
          const updated = [...messages];
          updated[idx] = { ...updated[idx], id: serverId, status: 'confirmed' };
          newMessagesByRoom[roomId] = updated;
          break;
        }
      }
      return { messagesByRoom: newMessagesByRoom };
    });
  },
}));
