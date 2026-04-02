import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing, fontSize, borderRadius } from '../theme';

type Props = {
  message: string;
  onRetry?: () => void;
};

export default function ErrorView({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="재시도"
        >
          <Text style={styles.retryText}>재시도</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.bg.primary,
  },
  icon: {
    fontSize: fontSize.xxl,
    color: colors.accent.error,
    fontWeight: 'bold',
    marginBottom: spacing.md,
  },
  message: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    backgroundColor: colors.accent.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  retryText: {
    color: colors.bubble.mineText,
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
});
