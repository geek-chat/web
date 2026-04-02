import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import type { Message } from '../store/chat.store';

type Props = {
  message: Message;
  isMine: boolean;
};

export default function MessageBubble({ message, isMine }: Props) {
  return (
    <View style={[styles.container, isMine ? styles.mine : styles.other]}>
      {!isMine && message.senderNickname && (
        <Text style={styles.nickname}>{message.senderNickname}</Text>
      )}
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={styles.content}>{message.content}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.time}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {isMine && message.status === 'pending' && (
          <Text style={styles.pending}>...</Text>
        )}
      </View>
    </View>
  );
}

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
    color: colors.textSecondary,
    marginBottom: 2,
  },
  bubble: {
    maxWidth: '75%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  bubbleMine: {
    backgroundColor: colors.messageMine,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: colors.messageOther,
    borderBottomLeftRadius: 4,
  },
  content: {
    color: colors.text,
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
    color: colors.textSecondary,
  },
  pending: {
    fontSize: 11,
    color: colors.pending,
  },
});
