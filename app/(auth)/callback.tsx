import { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { colors } from '../../src/theme/colors';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const params = useLocalSearchParams();

  useEffect(() => {
    // OAuth 콜백: 서버가 /auth/success#access_token=...&refresh_token=... 로 리다이렉트
    // expo-router는 hash fragment를 직접 파싱할 수 없으므로 window.location.hash 사용
    const hash =
      typeof window !== 'undefined' ? window.location.hash.substring(1) : '';
    const hashParams = new URLSearchParams(hash);
    const accessToken = hashParams.get('access_token') || (params.access_token as string);
    const refreshToken = hashParams.get('refresh_token') || (params.refresh_token as string);

    if (accessToken && refreshToken) {
      login({ accessToken, refreshToken }).then(() => {
        router.replace('/(app)/rooms');
      });
    } else {
      router.replace('/');
    }
  }, [login, router, params]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>로그인 처리 중...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    color: colors.text,
    marginTop: 16,
    fontSize: 16,
  },
});
