import { apiClient } from './client';

export type RoomMember = {
  userId: string;
  nickname: string;
  profileImageUrl?: string;
};

export type Room = {
  id: string;
  type: 'DIRECT' | 'GROUP';
  name: string | null;
  lastMessageAt: string | null;
  members: RoomMember[];
};

export type MessageResponse = {
  id: string;
  senderId: string;
  senderNickname: string;
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
};

type GetMessagesParams = {
  cursor?: string;
  limit?: number;
  direction?: 'forward' | 'backward';
};

export async function getRooms(): Promise<Room[]> {
  return apiClient<Room[]>('/api/rooms');
}

export async function createRoom(memberIds: string[], name?: string): Promise<Room> {
  return apiClient<Room>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({ memberIds, name }),
  });
}

export async function getMessages(
  roomId: string,
  params?: GetMessagesParams,
): Promise<MessageResponse[]> {
  const searchParams = new URLSearchParams();
  if (params?.cursor) {
    searchParams.set('cursor', params.cursor);
  }
  if (params?.limit) {
    searchParams.set('limit', String(params.limit));
  }
  if (params?.direction) {
    searchParams.set('direction', params.direction);
  }

  const query = searchParams.toString();
  const path = `/api/rooms/${roomId}/messages${query ? `?${query}` : ''}`;
  return apiClient<MessageResponse[]>(path);
}
