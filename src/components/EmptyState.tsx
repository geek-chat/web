import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, fontSize } from '../theme';

type Props = {
  icon?: string;
  title: string;
  description?: string;
};

export default function EmptyState({ icon, title, description }: Props) {
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  icon: {
    fontSize: fontSize.xxl + 8,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.lg,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
