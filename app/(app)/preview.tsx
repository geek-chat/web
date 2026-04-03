import { ScrollView, View, Text, StyleSheet } from 'react-native';
import MessageBubble from '../../src/components/MessageBubble';
import ChatInput from '../../src/components/ChatInput';
import RoomListItem from '../../src/components/RoomListItem';
import LoadingSpinner from '../../src/components/LoadingSpinner';
import ErrorView from '../../src/components/ErrorView';
import EmptyState from '../../src/components/EmptyState';
import Avatar from '../../src/components/Avatar';
import { colors, spacing, fontSize } from '../../src/theme';
import type { Message, Room } from '../../src/types';

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    roomId: 'room-1',
    senderId: 'other-user',
    senderNickname: 'Bob',
    content: '안녕하세요!',
    type: 'TEXT',
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    clientMessageId: 'cm-1',
  },
  {
    id: '2',
    roomId: 'room-1',
    senderId: 'me',
    senderNickname: 'Alice',
    content: '반갑습니다!',
    type: 'TEXT',
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    clientMessageId: 'cm-2',
  },
  {
    id: '3',
    roomId: 'room-1',
    senderId: 'me',
    senderNickname: 'Alice',
    content: '전송 중...',
    type: 'TEXT',
    createdAt: new Date().toISOString(),
    status: 'pending',
    clientMessageId: 'cm-3',
  },
  {
    id: '4',
    roomId: 'room-1',
    senderId: 'me',
    senderNickname: 'Alice',
    content: '전송 실패',
    type: 'TEXT',
    createdAt: new Date().toISOString(),
    status: 'failed',
    clientMessageId: 'cm-4',
  },
];

const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    type: 'DIRECT',
    name: null,
    lastMessageAt: new Date().toISOString(),
    members: [
      { userId: 'me', nickname: 'Alice' },
      { userId: 'other', nickname: 'Bob', profileImageUrl: 'https://i.pravatar.cc/40?u=bob' },
    ],
  },
  {
    id: 'room-2',
    type: 'GROUP',
    name: '개발팀',
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    members: [
      { userId: 'me', nickname: 'Alice' },
      { userId: 'u2', nickname: 'Bob' },
      { userId: 'u3', nickname: 'Charlie' },
    ],
  },
];

/**
 * 컴포넌트 미리보기 페이지 (개발 전용).
 * 모든 UI 컴포넌트를 한 화면에서 확인할 수 있다.
 *
 * 접속: http://localhost:8081/(app)/preview
 *
 * TODO: 프로덕션 빌드에서 제외
 */
export default function PreviewScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Avatar</Text>
      <View style={styles.row}>
        <Avatar name="Alice" size={40} />
        <Avatar name="Bob" size={40} uri="https://i.pravatar.cc/40?u=bob" />
        <Avatar name="Charlie" size={56} />
      </View>

      <Text style={styles.sectionTitle}>MessageBubble</Text>
      <View style={styles.section}>
        {MOCK_MESSAGES.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isMine={msg.senderId === 'me'}
            showTimestamp
            onRetry={(id) => console.log('Retry:', id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>RoomListItem</Text>
      <View style={styles.section}>
        {MOCK_ROOMS.map((room) => (
          <RoomListItem
            key={room.id}
            room={room}
            currentUserId="me"
            onPress={() => console.log('Room:', room.id)}
          />
        ))}
      </View>

      <Text style={styles.sectionTitle}>ChatInput</Text>
      <View style={styles.section}>
        <ChatInput onSend={(msg) => console.log('Send:', msg)} />
      </View>

      <Text style={styles.sectionTitle}>LoadingSpinner</Text>
      <View style={[styles.section, { height: 100 }]}>
        <LoadingSpinner />
      </View>

      <Text style={styles.sectionTitle}>ErrorView</Text>
      <View style={[styles.section, { height: 200 }]}>
        <ErrorView message="네트워크 연결 실패" onRetry={() => console.log('Retry')} />
      </View>

      <Text style={styles.sectionTitle}>EmptyState</Text>
      <View style={[styles.section, { height: 200 }]}>
        <EmptyState
          title="채팅방이 없습니다"
          description="새 대화를 시작해보세요"
        />
      </View>

      <Text style={styles.sectionTitle}>색상 팔레트</Text>
      <View style={styles.row}>
        {Object.entries(colors.accent).map(([name, color]) => (
          <View key={name} style={styles.colorItem}>
            <View style={[styles.colorBox, { backgroundColor: color }]} />
            <Text style={styles.colorLabel}>{name}</Text>
          </View>
        ))}
      </View>
      <View style={styles.row}>
        {Object.entries(colors.bg).map(([name, color]) => (
          <View key={name} style={styles.colorItem}>
            <View style={[styles.colorBox, { backgroundColor: color, borderWidth: 1, borderColor: colors.border }]} />
            <Text style={styles.colorLabel}>{name}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary, padding: spacing.md },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: 'bold', color: colors.text.primary, marginTop: spacing.lg, marginBottom: spacing.sm },
  section: { marginBottom: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.md },
  colorItem: { alignItems: 'center' },
  colorBox: { width: 48, height: 48, borderRadius: 8 },
  colorLabel: { fontSize: fontSize.xs, color: colors.text.secondary, marginTop: 4 },
});
