import { useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { useChat } from '../../../src/hooks/useChat';
import { useAuth } from '../../../src/hooks/useAuth';
import MessageBubble from '../../../src/components/MessageBubble';
import ChatInput from '../../../src/components/ChatInput';
import { colors } from '../../../src/theme/colors';
import type { Message } from '../../../src/store/chat.store';

export default function ChatScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { messagesByRoom, loadMessages, sendMessage, rooms } = useChat();
  const { user } = useAuth();
  const flatListRef = useRef<FlatList<Message>>(null);

  const messages = messagesByRoom[roomId] || [];

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

  const handleSend = (content: string) => {
    if (!user?.id || !roomId) {
      return;
    }
    sendMessage(roomId, content, user.id);
  };

  return (
    <>
      <Stack.Screen options={{ title }} />
      <View style={styles.container}>
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <MessageBubble
              message={item}
              isMine={item.senderId === user?.id}
            />
          )}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
        <ChatInput onSend={handleSend} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  messageList: {
    paddingVertical: 8,
  },
});
