import { useEffect, useRef, useMemo, useCallback } from 'react';
import { View, FlatList, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useChat } from '../../../src/hooks/useChat';
import { useAuth } from '../../../src/hooks/useAuth';
import MessageBubble from '../../../src/components/MessageBubble';
import ChatInput from '../../../src/components/ChatInput';
import { colors } from '../../../src/theme';
import { isSameMinute } from '../../../src/utils/date';
import type { Message } from '../../../src/types';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messagesByRoom, loadMessages, sendMessage, rooms } = useChat();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList<Message>>(null);

  const messages = messagesByRoom[roomId] || [];

  const reversed = useMemo(() => [...messages].reverse(), [messages]);

  const room = rooms.find((r) => r.id === roomId);
  const otherMembers = room?.members.filter((m) => m.userId !== user?.id);
  const title =
    room?.type === 'DIRECT'
      ? otherMembers?.[0]?.nickname ?? '채팅'
      : room?.name ?? '그룹 채팅';

  useEffect(() => {
    if (roomId) {
      loadMessages(roomId);
    }
  }, [roomId, loadMessages]);

  const handleSend = useCallback((content: string) => {
    if (!user?.id || !roomId) {
      return;
    }
    sendMessage(roomId, content, user.id);
  }, [user?.id, roomId, sendMessage]);

  const renderItem = useCallback(({ item, index }: { item: Message; index: number }) => {
    const nextItem = reversed[index + 1];
    const showTimestamp =
      !nextItem ||
      nextItem.senderId !== item.senderId ||
      !isSameMinute(item.createdAt, nextItem.createdAt);

    return (
      <MessageBubble
        message={item}
        isMine={item.senderId === user?.id}
        showTimestamp={showTimestamp}
      />
    );
  }, [reversed, user?.id]);

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
          data={reversed}
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
});
