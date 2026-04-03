import { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';
import { formatTime } from '../utils/date';
import type { Message } from '../types';

type Props = {
  message: Message;
  isMine: boolean;
  showTimestamp?: boolean;
  onRetry?: (clientMessageId: string) => void;
};

function MessageBubble({ message, isMine, showTimestamp = true, onRetry }: Props) {
  const timeStr = formatTime(message.createdAt);
  const senderLabel = isMine ? '나' : (message.senderNickname ?? '상대방');

  return (
    <View
      style={[styles.container, isMine ? styles.mine : styles.other]}
      accessibilityLabel={`${senderLabel}: ${message.content}, ${timeStr}`}
      testID="message-bubble"
    >
      {!isMine && message.senderNickname && (
        <Text style={styles.nickname}>{message.senderNickname}</Text>
      )}
      <View
        style={[
          styles.bubble,
          isMine ? styles.bubbleMine : styles.bubbleOther,
          isMine && message.status === 'pending' && styles.bubblePending,
        ]}
      >
        <Text style={isMine ? styles.contentMine : styles.contentOther}>
          {message.content}
        </Text>
      </View>
      <View style={styles.meta}>
        {showTimestamp && <Text style={styles.time}>{timeStr}</Text>}
        {isMine && message.status === 'pending' && (
          <Text style={styles.statusPending} testID="message-pending">...</Text>
        )}
        {isMine && message.status === 'confirmed' && (
          <Text style={styles.statusConfirmed} testID="message-confirmed">&#10003;</Text>
        )}
        {isMine && message.status === 'failed' && (
          <Pressable
            onPress={() => onRetry?.(message.clientMessageId)}
            accessibilityRole="button"
            accessibilityLabel="메시지 재전송"
          >
            <Text style={styles.statusFailed} testID="message-failed">!</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

export default memo(MessageBubble);

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  mine: {
    alignItems: 'flex-end',
  },
  other: {
    alignItems: 'flex-start',
  },
  nickname: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bubbleMine: {
    backgroundColor: colors.bubble.mine,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.bubble.other,
    borderBottomLeftRadius: 4,
  },
  bubblePending: {
    opacity: 0.7,
  },
  contentMine: {
    color: colors.bubble.mineText,
    fontSize: 15,
    lineHeight: 20,
  },
  contentOther: {
    color: colors.bubble.otherText,
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  time: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  statusPending: {
    fontSize: 11,
    color: colors.status.pending,
  },
  statusConfirmed: {
    fontSize: 11,
    color: colors.status.confirmed,
  },
  statusFailed: {
    fontSize: 14,
    color: colors.status.failed,
    fontWeight: 'bold',
    paddingHorizontal: 4,
  },
});
