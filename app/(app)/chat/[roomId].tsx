import { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, FlatList, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { useAuth } from '../../../src/hooks/useAuth';
import { useChatStore } from '../../../src/store/chat.store';
import { getSocket } from '../../../src/socket/socket';
import MessageBubble from '../../../src/components/MessageBubble';
import ChatInput from '../../../src/components/ChatInput';
import { colors } from '../../../src/theme';
import { isSameMinute } from '../../../src/utils/date';
import type { Message } from '../../../src/types';

export default function ChatScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const rooms = useChatStore((s) => s.rooms);
  const messagesByRoom = useChatStore((s) => s.messagesByRoom);
  const readStatusByRoom = useChatStore((s) => s.readStatusByRoom);
  const loadMessages = useChatStore((s) => s.loadMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);
  const loadRooms = useChatStore((s) => s.loadRooms);
  const { user } = useAuth();
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
    const lastMessage = messages[0];
    if (lastMessage && lastMessage.status === 'confirmed') {
      const socket = getSocket();
      socket?.emit('mark_read', { roomId, lastReadMessageId: lastMessage.id });
    }
  }, [roomId, messages]);

  const handleSend = useCallback((content: string) => {
    if (!user?.id || !roomId) {
      return;
    }
    sendMessage(roomId, content, user.id);
  }, [user?.id, roomId, sendMessage]);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    // inverted FlatList: data[0]=최신(하단), data[n]=오래된(상단). index+1 = 시간상 이전 메시지
    const prevItem = messages[index + 1];
    const showTimestamp =
      !prevItem ||
      prevItem.senderId !== item.senderId ||
      !isSameMinute(item.createdAt, prevItem.createdAt);

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
      <Stack.Screen
        options={{
          title,
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="뒤로 가기"
            >
              <Text style={styles.backButtonText}>{'← 뒤로'}</Text>
            </Pressable>
          ),
        }}
      />
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
  backButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  backButtonText: {
    color: colors.accent.primary,
    fontSize: 15,
  },
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
