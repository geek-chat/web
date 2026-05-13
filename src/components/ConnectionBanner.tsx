import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  isConnected: boolean;
  onRetry: () => void;
};

/**
 * 소켓 연결이 끊겼을 때 화면 상단에 표시되는 배너.
 *
 * 표시 조건: isConnected === false
 * 클릭 시: 강제 재연결 시도 (onRetry)
 */
export default function ConnectionBanner({ isConnected, onRetry }: Props) {
  if (isConnected) {
    return null;
  }

  return (
    <Pressable
      onPress={onRetry}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="연결이 끊겼습니다. 눌러서 다시 연결"
      testID="connection-banner"
    >
      <View style={styles.dot} />
      <Text style={styles.text}>연결이 끊겼습니다. 다시 연결하려면 탭하세요</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent.warning,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.text.inverse,
  },
  text: {
    color: colors.text.inverse,
    fontSize: 13,
    fontWeight: '600',
  },
});
