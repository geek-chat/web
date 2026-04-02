import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

type Props = {
  size?: 'small' | 'large';
};

export default function LoadingSpinner({ size = 'large' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={colors.accent.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg.primary,
  },
});
