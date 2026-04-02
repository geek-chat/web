import { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { colors } from '../../src/theme';
import LoadingSpinner from '../../src/components/LoadingSpinner';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const params = useLocalSearchParams();

  useEffect(() => {
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
      <LoadingSpinner />
      <Text style={styles.text}>로그인 처리 중...</Text>
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
  text: {
    color: colors.text.primary,
    marginTop: 16,
    fontSize: 16,
  },
});
