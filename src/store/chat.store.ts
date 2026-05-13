import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { getSocket, forceReconnect } from '../socket/socket';
import { getRooms as fetchRooms, getMessages as fetchMessages } from '../api/chat';
import type { Room, MessageResponse, Message } from '../types';

export type { Message } from '../types';

type ChatState = {
  rooms: Room[];
  messagesByRoom: Record<string, Message[]>;
  /** roomId → { userId → lastReadAt } */
  readStatusByRoom: Record<string, Record<string, string>>;
  /** 소켓 연결 상태 — UI 배너 표시용 */
  isConnected: boolean;
  loadRooms: () => Promise<void>;
  loadMessages: (roomId: string, cursor?: string) => Promise<void>;
  /** 재연결 시 마지막 메시지 이후의 누락된 메시지를 forward 방향으로 동기화 */
  syncMessagesAfterReconnect: (roomId: string) => Promise<void>;
  /** 모든 활성 방의 누락 메시지 일괄 동기화 */
  syncAllRoomsAfterReconnect: () => Promise<void>;
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
  updateReadStatus: (roomId: string, userId: string, lastReadAt: string) => void;
  setConnected: (connected: boolean) => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  rooms: [],
  messagesByRoom: {},
  readStatusByRoom: {},
  isConnected: false,

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
            [roomId]: [...existing, ...newMessages],
          },
        };
      }

      // 초기 로드: pending 메시지 보존 + 서버 메시지와 병합
      const pendingMessages = existing.filter((m) => m.status === 'pending');
      const serverIds = new Set(messages.map((m) => m.id));
      // pending 중 서버에 이미 반영된 메시지 제거 (clientMessageId 기준)
      const unresolvedPending = pendingMessages.filter(
        (m) => !serverIds.has(m.id) && !messages.some((sm) => sm.clientMessageId === m.clientMessageId),
      );

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [...unresolvedPending, ...messages],
        },
      };
    });
  },

  syncMessagesAfterReconnect: async (roomId) => {
    const existing = get().messagesByRoom[roomId];
    if (!existing || existing.length === 0) {
      return;
    }

    // confirmed 메시지 중 가장 최신의 createdAt을 cursor로 사용
    const confirmedMessages = existing.filter((m) => m.status === 'confirmed');
    if (confirmedMessages.length === 0) {
      return;
    }

    const latestCreatedAt = confirmedMessages
      .map((m) => m.createdAt)
      .sort()
      .pop();

    if (!latestCreatedAt) {
      return;
    }

    const responses = await fetchMessages(roomId, {
      cursor: latestCreatedAt,
      direction: 'forward',
    });

    if (responses.length === 0) {
      return;
    }

    const newMessages: Message[] = responses.map((m: MessageResponse) => ({
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
      const currentMessages = state.messagesByRoom[roomId] || [];
      const existingIds = new Set(currentMessages.map((m) => m.id));
      const uniqueNewMessages = newMessages.filter((m) => !existingIds.has(m.id));

      if (uniqueNewMessages.length === 0) {
        return state;
      }

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [roomId]: [...uniqueNewMessages, ...currentMessages],
        },
      };
    });
  },

  syncAllRoomsAfterReconnect: async () => {
    const roomIds = Object.keys(get().messagesByRoom);
    // 방 목록도 새로고침 (lastMessageAt, 새 방 등 반영)
    try {
      await get().loadRooms();
    } catch (e) {
      console.error('[Sync] loadRooms failed:', e);
    }
    // 각 방의 누락 메시지를 병렬 sync
    await Promise.all(
      roomIds.map((roomId) =>
        get()
          .syncMessagesAfterReconnect(roomId)
          .catch((e) => console.error(`[Sync] room ${roomId} failed:`, e)),
      ),
    );
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
        [roomId]: [pendingMessage, ...(state.messagesByRoom[roomId] || [])],
      },
    }));

    // Send 시점 가드 — 소켓이 죽었으면 강제 재연결.
    // socket.io는 disconnected 상태에서도 emit을 버퍼링하므로
    // 재연결 후 자동으로 전송된다. 좀비 상태(connected=true but TCP dead)는
    // 별도 트리거(visibilitychange 등)로 감지된다.
    const socket = getSocket();
    if (!socket || !socket.connected) {
      console.warn('[Send] Socket not connected — forcing reconnect, message buffered');
      forceReconnect();
    }
    // forceReconnect 후 getSocket()으로 새 인스턴스 가져오기
    getSocket()?.emit('send_message', { roomId, content, clientMessageId });
  },

  receiveMessage: (msg) => {
    set((state) => {
      const roomMessages = state.messagesByRoom[msg.roomId] || [];
      // 중복 방지: 서버 ID 또는 pending 메시지의 clientMessageId로 비교
      const isDuplicate = roomMessages.some(
        (m) => m.id === msg.id || m.clientMessageId === msg.id,
      );
      if (isDuplicate) {
        return state;
      }

      return {
        messagesByRoom: {
          ...state.messagesByRoom,
          [msg.roomId]: [
            {
              ...msg,
              status: 'confirmed' as const,
              clientMessageId: msg.id,
            },
            ...roomMessages,
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
          // new_message가 ack보다 먼저 도착해서 이미 추가된 경우 → pending 제거
          const alreadyExists = messages.some((m, i) => i !== idx && m.id === serverId);
          if (alreadyExists) {
            const updated = messages.filter((_, i) => i !== idx);
            newMessagesByRoom[roomId] = updated;
          } else {
            const updated = [...messages];
            updated[idx] = { ...updated[idx], id: serverId, status: 'confirmed' };
            newMessagesByRoom[roomId] = updated;
          }
          break;
        }
      }
      return { messagesByRoom: newMessagesByRoom };
    });
  },

  updateReadStatus: (roomId, userId, lastReadAt) => {
    set((state) => ({
      readStatusByRoom: {
        ...state.readStatusByRoom,
        [roomId]: {
          ...(state.readStatusByRoom[roomId] || {}),
          [userId]: lastReadAt,
        },
      },
    }));
  },

  setConnected: (connected) => {
    set({ isConnected: connected });
  },
}));
