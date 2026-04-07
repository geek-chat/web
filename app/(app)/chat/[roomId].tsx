import { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useChat } from '../../../src/hooks/useChat';
import { useAuth } from '../../../src/hooks/useAuth';
import { useChatStore } from '../../../src/store/chat.store';
import MessageBubble from '../../../src/components/MessageBubble';
import ChatInput from '../../../src/components/ChatInput';
import { colors } from '../../../src/theme';
import { isSameMinute } from '../../../src/utils/date';
import type { Message } from '../../../src/types';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messagesByRoom, readStatusByRoom, loadMessages, sendMessage, rooms, markRead } = useChat();
  const { user } = useAuth();
  const loadRooms = useChatStore((s) => s.loadRooms);
  const flatListRef = useRef<FlatList<Message>>(null);

  const messages = messagesByRoom[roomId] || [];

  const room = rooms.find((r) => r.id === roomId);

  // 새로고침 시 rooms가 비어있으면 로드
  useEffect(() => {
    if (rooms.length === 0) {
      loadRooms();
    }
  }, [rooms.length, loadRooms]);
  const otherMembers = room?.members.filter((m) => m.userId !== user?.id);
  const title = !room
    ? ''
    : room.type === 'DIRECT'
      ? otherMembers?.[0]?.nickname ?? '채팅'
      : room.name ?? '그룹 채팅';

  // 상대방의 lastReadAt
  const otherReadAt = useMemo(() => {
    if (!roomId || !user?.id) {
      return null;
    }
    const roomReadStatus = readStatusByRoom[roomId];
    if (!roomReadStatus) {
      return null;
    }
    const otherEntries = Object.entries(roomReadStatus).filter(([uid]) => uid !== user.id);
    if (otherEntries.length === 0) {
      return null;
    }
    return otherEntries.reduce((latest, [, readAt]) =>
      !latest || readAt > latest ? readAt : latest, '' as string);
  }, [readStatusByRoom, roomId, user?.id]);

  useEffect(() => {
    if (roomId) {
      loadMessages(roomId);
    }
  }, [roomId, loadMessages]);

  // 채팅방 진입 시 + 새 메시지 수신 시 mark_read
  useEffect(() => {
    if (!roomId || messages.length === 0) {
      return;
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.status === 'confirmed') {
      markRead(roomId, lastMessage.id);
    }
  }, [roomId, messages, markRead]);

  const handleSend = useCallback((content: string) => {
    if (!user?.id || !roomId) {
      return;
    }
    sendMessage(roomId, content, user.id);
  }, [user?.id, roomId, sendMessage]);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    // inverted FlatList: index 0 = 최신 메시지(화면 하단), index+1 = 더 오래된 메시지
    const nextItem = messages[messages.length - 1 - (index + 1)];
    const showTimestamp =
      !nextItem ||
      nextItem.senderId !== item.senderId ||
      !isSameMinute(item.createdAt, nextItem.createdAt);

    const isMine = item.senderId === user?.id;
    const isRead = isMine && otherReadAt != null && item.createdAt <= otherReadAt;

    return (
      <View>
        <MessageBubble
          message={item}
          isMine={isMine}
          showTimestamp={showTimestamp}
        />
        {isMine && isRead && showTimestamp && (
          <Text style={styles.readIndicator}>읽음</Text>
        )}
      </View>
    );
  }, [messages, user?.id, otherReadAt]);

  return (
    <>
      <Stack.Screen options={{ title }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.clientMessageId || item.id}
          renderItem={renderItem}
          inverted
          initialNumToRender={20}
          maxToRenderPerBatch={10}
          windowSize={10}
          removeClippedSubviews={Platform.OS !== 'web'}
          contentContainerStyle={styles.messageList}
        />
        <ChatInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  messageList: {
    paddingVertical: 8,
  },
  readIndicator: {
    fontSize: 11,
    color: colors.status.confirmed,
    textAlign: 'right',
    paddingRight: 16,
    marginTop: -2,
    marginBottom: 4,
  },
});
