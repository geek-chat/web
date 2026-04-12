export type User = {
  id: string;
  nickname: string;
  username?: string;
  profileImageUrl?: string;
};

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

export type MessageStatus = 'pending' | 'confirmed' | 'failed';

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  senderNickname?: string;
  content: string;
  type: 'TEXT' | 'SYSTEM';
  createdAt: string;
  status: MessageStatus;
  clientMessageId: string;
};
