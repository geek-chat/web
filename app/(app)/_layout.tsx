import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { getMe } from '../../src/api/auth';
import { useChat } from '../../src/hooks/useChat';
import ConnectionBanner from '../../src/components/ConnectionBanner';
import { colors } from '../../src/theme';

export default function AppLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // 소켓 연결은 앱 레이아웃에서 1번만 수행 (화면 이동 시 재연결 방지)
  const { isConnected, reconnect } = useChat();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    if (!isAuthenticated) {
      // Root Layout 마운트 완료 후 실행되도록 defer
      const timer = setTimeout(() => {
        router.replace('/');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, router]);

  // 로그인 후 user 정보가 없으면 /auth/me로 가져옴
  useEffect(() => {
    if (isAuthenticated && !user) {
      getMe()
        .then((me) => setUser(me))
        .catch(() => {
          // 토큰 무효 → 로그아웃
        });
    }
  }, [isAuthenticated, user, setUser]);

  // username 미설정 시 설정 화면으로 리다이렉트
  useEffect(() => {
    if (isAuthenticated && user && !user.username) {
      const timer = setTimeout(() => {
        router.replace('/(app)/setup-username');
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ConnectionBanner isConnected={isConnected} onRetry={reconnect} />
      <View style={styles.stackWrapper}>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.bg.secondary },
            headerTintColor: colors.text.primary,
            contentStyle: { backgroundColor: colors.bg.primary },
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  stackWrapper: {
    flex: 1,
  },
});
