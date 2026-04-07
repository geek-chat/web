import { useEffect } from 'react';
import { Stack, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { getMe } from '../../src/api/auth';
import { colors } from '../../src/theme';

export default function AppLayout() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.bg.secondary },
        headerTintColor: colors.text.primary,
        contentStyle: { backgroundColor: colors.bg.primary },
      }}
    />
  );
}
