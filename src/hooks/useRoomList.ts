import { useState, useCallback } from 'react';
import { useChatStore } from '../store/chat.store';
import { createRoom } from '../api/chat';
import type { Room } from '../types';

export function useRoomList() {
  const rooms = useChatStore((s) => s.rooms);
  const loadRooms = useChatStore((s) => s.loadRooms);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateRoom = useCallback(
    async (memberIds: string[], name?: string): Promise<Room> => {
      setIsCreating(true);
      try {
        const room = await createRoom(memberIds, name);
        await loadRooms();
        return room;
      } finally {
        setIsCreating(false);
      }
    },
    [loadRooms],
  );

  return { rooms, loadRooms, createRoom: handleCreateRoom, isCreating };
}
