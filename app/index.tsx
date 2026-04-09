import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';
import { colors, fontSize, spacing, borderRadius } from '../src/theme';
import { useEffect, useState } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

const ERROR_MESSAGES: Record<string, string> = {
  oauth_cancelled: '로그인이 취소되었습니다.',
  missing_params: '로그인 처리 중 오류가 발생했습니다.',
  login_failed: '로그인에 실패했습니다. 다시 시도해주세요.',
};

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ error?: string }>();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(app)/rooms');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (params.error) {
      setErrorMessage(ERROR_MESSAGES[params.error] || '알 수 없는 오류가 발생했습니다.');
    }
  }, [params.error]);

  const handleOAuthLogin = (provider: 'google' | 'naver') => {
    setErrorMessage(null);
    const url = `${API_URL}/auth/${provider}`;
    if (Platform.OS === 'web') {
      window.location.href = url;
    }
  };

  return (
    <View style={styles.container} testID="login-screen">
      <Text style={styles.title}>GeekChat</Text>
      <Text style={styles.subtitle}>미니멀 메신저</Text>

      {errorMessage && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      )}

      <Pressable
        style={[styles.button, styles.googleButton]}
        onPress={() => handleOAuthLogin('google')}
        accessibilityRole="button"
        accessibilityLabel="Google 로그인"
        testID="login-google"
      >
        <Text style={styles.buttonText}>Google 로그인</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.naverButton]}
        onPress={() => handleOAuthLogin('naver')}
        accessibilityRole="button"
        accessibilityLabel="Naver 로그인"
        testID="login-naver"
      >
        <Text style={styles.buttonText}>Naver 로그인</Text>
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
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    maxWidth: 300,
  },
  errorText: {
    color: '#EF4444',
    fontSize: fontSize.sm,
    textAlign: 'center',
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
