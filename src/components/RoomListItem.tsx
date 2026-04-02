import { memo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
import { colors } from '../theme';
import Avatar from './Avatar';
import type { Room } from '../types';

type Props = {
  room: Room;
  currentUserId: string;
  onPress: () => void;
};

function RoomListItem({ room, currentUserId, onPress }: Props) {
  const otherMembers = room.members.filter((m) => m.userId !== currentUserId);
  const displayName =
    room.type === 'DIRECT'
      ? otherMembers[0]?.nickname ?? '알 수 없음'
      : room.name ?? '그룹 채팅';

  const profileImage = otherMembers[0]?.profileImageUrl;

  const timeString = room.lastMessageAt
    ? new Date(room.lastMessageAt).toLocaleDateString()
    : '';

  return (
    <Pressable
      style={styles.container}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${displayName} 채팅방`}
    >
      <View style={styles.avatarWrapper}>
        <Avatar uri={profileImage} name={displayName} size={44} />
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

export default memo(RoomListItem);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  memberCount: {
    color: colors.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  time: {
    color: colors.text.secondary,
    fontSize: 12,
  },
});
