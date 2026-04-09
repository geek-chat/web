import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { colors, fontSize, spacing, borderRadius } from '../src/theme';
import { useEffect } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/rooms');
    }
  }, [isAuthenticated, router]);

  const handleOAuthLogin = (provider: 'google' | 'naver') => {
    const url = `${API_URL}/auth/${provider}`;
    if (Platform.OS === 'web') {
      window.location.href = url;
    }
  };

  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>GeekChat</Text>
      <Text style={styles.subtitle}>미니멀 메신저</Text>

      <Pressable
        style={[styles.button, styles.googleButton]}
        onPress={() => handleOAuthLogin('google')}
        accessibilityRole="button"
        accessibilityLabel="Google로 로그인"
        testID="login-google"
      >
        <Text style={styles.buttonText}>Google로 로그인</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.naverButton]}
        onPress={() => handleOAuthLogin('naver')}
        accessibilityRole="button"
        accessibilityLabel="Naver로 로그인"
        testID="login-naver"
      >
        <Text style={styles.buttonText}>Naver로 로그인</Text>
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
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginVertical: spacing.sm,
    minWidth: 240,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  naverButton: {
    backgroundColor: '#03C75A',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: fontSize.md,
    fontWeight: '600',
  },
});
