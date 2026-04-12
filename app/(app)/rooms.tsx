import { useEffect, useState } from 'react';
import { View, FlatList, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuth } from '../../src/hooks/useAuth';
import { useRoomList } from '../../src/hooks/useRoomList';
import { useUserSearch } from '../../src/hooks/useUserSearch';
import RoomListItem from '../../src/components/RoomListItem';
import Avatar from '../../src/components/Avatar';
import EmptyState from '../../src/components/EmptyState';
import { colors } from '../../src/theme';

export default function RoomsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { rooms, loadRooms, createRoom } = useRoomList();
  const [showCreate, setShowCreate] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { results: searchResults, isSearching } = useUserSearch(searchQuery);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleSelectUser = async (targetUserId: string) => {
    try {
      const room = await createRoom([targetUserId]);
      setShowCreate(false);
      setSearchQuery('');
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
          onPress={() => {
            setShowCreate(!showCreate);
            setSearchQuery('');
          }}
          accessibilityRole="button"
          accessibilityLabel={showCreate ? '채팅 생성 취소' : '새 채팅 시작'}
          testID="new-chat-button"
        >
          <Text style={styles.createButtonText}>
            {showCreate ? '취소' : '+ 새 채팅'}
          </Text>
        </Pressable>

        {showCreate && (
          <View style={styles.searchSection}>
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="닉네임으로 검색"
              placeholderTextColor={colors.text.placeholder}
              autoFocus
              accessibilityLabel="닉네임으로 검색"
            />
            {isSearching && (
              <Text style={styles.searchStatus}>검색 중...</Text>
            )}
            {searchResults.length > 0 && (
              <View style={styles.searchResults}>
                {searchResults.map((u) => (
                  <Pressable
                    key={u.id}
                    style={styles.searchResultItem}
                    onPress={() => handleSelectUser(u.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`${u.nickname}와 채팅 시작`}
                  >
                    <Avatar uri={u.profileImageUrl} name={u.nickname} size={36} />
                    <Text style={styles.searchResultName}>{u.nickname}</Text>
                  </Pressable>
                ))}
              </View>
            )}
            {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <Text style={styles.searchStatus}>검색 결과가 없습니다</Text>
            )}
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
  searchSection: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInput: {
    backgroundColor: colors.bg.secondary,
    color: colors.text.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 12,
    marginTop: 8,
    fontSize: 15,
  },
  searchStatus: {
    color: colors.text.secondary,
    fontSize: 13,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchResults: {
    paddingVertical: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  searchResultName: {
    color: colors.text.primary,
    fontSize: 15,
  },
});
