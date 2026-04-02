import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { Room } from '../api/chat';

type Props = {
  room: Room;
  currentUserId: string;
  onPress: () => void;
};

export default function RoomListItem({ room, currentUserId, onPress }: Props) {
  const otherMembers = room.members.filter((m) => m.userId !== currentUserId);
  const displayName =
    room.type === 'DIRECT'
      ? otherMembers[0]?.nickname ?? '알 수 없음'
      : room.name ?? '그룹 채팅';

  const timeString = room.lastMessageAt
    ? new Date(room.lastMessageAt).toLocaleDateString()
    : '';

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {displayName}
        </Text>
        {room.type === 'GROUP' && (
          <Text style={styles.memberCount}>
            {room.members.length}명
          </Text>
        )}
      </View>
      {timeString ? <Text style={styles.time}>{timeString}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  memberCount: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: colors.textSecondary,
    fontSize: 12,
  },
});
