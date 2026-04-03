import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { colors, fontSize, spacing, borderRadius } from '../src/theme';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleDevLogin = async (name: string) => {
    const res = await fetch(`${API_URL}/auth/dev-login?name=${name}`);
    const data = await res.json();
    await login({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    router.replace('/(app)/rooms');
  };

  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>GeekChat</Text>
      <Text style={styles.subtitle}>미니멀 메신저</Text>

      <Pressable
        style={styles.button}
        onPress={() => handleDevLogin('Alice')}
        accessibilityRole="button"
        accessibilityLabel="Alice로 로그인"
        testID="dev-login-alice"
      >
        <Text style={styles.buttonText}>Alice로 로그인 (Dev)</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={() => handleDevLogin('Bob')}
        accessibilityRole="button"
        accessibilityLabel="Bob으로 로그인"
        testID="dev-login-bob"
      >
        <Text style={styles.buttonText}>Bob으로 로그인 (Dev)</Text>
      </Pressable>
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
  title: {
    fontSize: fontSize.xxl,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.md,
    color: colors.text.secondary,
    marginBottom: 40,
  },
  button: {
    backgroundColor: colors.bg.tertiary,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
    minWidth: 240,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.primary,
    fontSize: fontSize.md,
  },
});
