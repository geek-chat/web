import { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useChat } from '../../src/hooks/useChat';
import { useAuth } from '../../src/hooks/useAuth';
import RoomListItem from '../../src/components/RoomListItem';
import { createRoom } from '../../src/api/chat';
import { colors } from '../../src/theme/colors';

export default function RoomsScreen() {
  const router = useRouter();
  const { rooms, loadRooms } = useChat();
  const { user, logout } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [targetName, setTargetName] = useState('');

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleCreateRoom = async () => {
    if (!targetName.trim()) {
      return;
    }
    // Phase 1: dev-login 사용자끼리 1:1 — userId를 직접 입력
    // 프로덕션에서는 사용자 검색 UI로 교체
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
            <Pressable onPress={logout} style={styles.headerButton}>
              <Text style={styles.headerButtonText}>로그아웃</Text>
            </Pressable>
          ),
        }}
      />
      <View style={styles.container}>
        <Pressable
          style={styles.createButton}
          onPress={() => setShowCreate(!showCreate)}
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
              placeholderTextColor={colors.textSecondary}
              onSubmitEditing={handleCreateRoom}
            />
            <Pressable style={styles.createSubmit} onPress={handleCreateRoom}>
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
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>채팅방이 없습니다</Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  createButton: {
    padding: 16,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  createButtonText: {
    color: colors.primary,
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
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  createSubmit: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  createSubmitText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
});
