import { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useChat } from '../../src/hooks/useChat';
import { useAuth } from '../../src/hooks/useAuth';
import { useRoomList } from '../../src/hooks/useRoomList';
import RoomListItem from '../../src/components/RoomListItem';
import EmptyState from '../../src/components/EmptyState';
import { colors } from '../../src/theme';

export default function RoomsScreen() {
  const router = useRouter();
  useChat();
  const { user, logout } = useAuth();
  const { rooms, loadRooms, createRoom } = useRoomList();
  const [showCreate, setShowCreate] = useState(false);
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleCreateRoom = async () => {
    if (!targetName.trim()) {
      return;
    }
    try {
      const room = await createRoom([targetName.trim()]);
      setShowCreate(false);
      setTargetName('');
      router.push(`/(app)/chat/${room.id}`);
    } catch (err) {
      console.error('Failed to create room:', err);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'GeekChat',
          headerRight: () => (
            <Pressable
              onPress={logout}
              style={styles.headerButton}
              accessibilityRole="button"
              accessibilityLabel="로그아웃"
              testID="logout-button"
            >
              <Text style={styles.headerButtonText}>로그아웃</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreate(!showCreate)}
          accessibilityRole="button"
          accessibilityLabel={showCreate ? '채팅 생성 취소' : '새 채팅 시작'}
          testID="new-chat-button"
        >
          <Text style={styles.createButtonText}>
            {showCreate ? '취소' : '+ 새 채팅'}
          </Text>
        </Pressable>

        {showCreate && (
          <View style={styles.createForm}>
            <TextInput
              style={styles.createInput}
              value={targetName}
              onChangeText={setTargetName}
              placeholder="상대방 User ID 입력"
              placeholderTextColor={colors.text.placeholder}
              onSubmitEditing={handleCreateRoom}
              accessibilityLabel="상대방 User ID 입력"
            />
            <Pressable
              style={styles.createSubmit}
              onPress={handleCreateRoom}
              accessibilityRole="button"
              accessibilityLabel="채팅방 생성"
            >
              <Text style={styles.createSubmitText}>생성</Text>
            </Pressable>
          </View>
        )}

        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <RoomListItem
              room={item}
              currentUserId={user?.id ?? ''}
              onPress={() => router.push(`/(app)/chat/${item.id}`)}
            />
          )}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={10}
          ListEmptyComponent={
            <EmptyState
              title="채팅방이 없습니다"
              description="위의 '+ 새 채팅' 버튼을 눌러 대화를 시작하세요"
            />
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: colors.accent.primary,
    fontSize: 14,
  },
  createButton: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createButtonText: {
    color: colors.accent.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  createForm: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createInput: {
    flex: 1,
    backgroundColor: colors.bg.secondary,
    color: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createSubmit: {
    backgroundColor: colors.accent.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  createSubmitText: {
    color: colors.bubble.mineText,
    fontWeight: '600',
  },
});
