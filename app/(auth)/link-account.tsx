import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { linkProvider } from '../../src/api/auth';
import { colors } from '../../src/theme';
import LoadingSpinner from '../../src/components/LoadingSpinner';

/**
 * 계정 연동 확인 화면.
 *
 * 이메일이 같은 기존 계정이 발견되었을 때 표시.
 * 사용자가 연동 또는 새 계정 생성을 선택한다.
 */
export default function LinkAccountScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    linkToken: string;
    existingNickname: string;
    newProvider: string;
  }>();
  const login = useAuthStore((s) => s.login);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const providerLabel = params.newProvider === 'NAVER' ? '네이버' : '구글';

  const handleLink = async (confirm: boolean) => {
    if (!params.linkToken || isLoading) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const tokens = await linkProvider(params.linkToken, confirm);
      await login({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
      router.replace('/(app)/rooms');
    } catch (err) {
      setError('처리에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
        <Text style={styles.loadingText}>처리 중...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: '계정 연동', headerShown: false }} />
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>기존 계정이 발견되었습니다</Text>
          <Text style={styles.description}>
            <Text style={styles.highlight}>{params.existingNickname}</Text> 님의 계정과{'\n'}
            같은 이메일로 {providerLabel} 로그인을 시도했습니다.{'\n\n'}
            기존 계정에 {providerLabel} 로그인을 연동할까요?
          </Text>

          {error.length > 0 && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable
            style={styles.primaryButton}
            onPress={() => handleLink(true)}
            accessibilityRole="button"
            accessibilityLabel="기존 계정에 연동"
          >
            <Text style={styles.primaryButtonText}>연동하기</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => handleLink(false)}
            accessibilityRole="button"
            accessibilityLabel="새 계정으로 시작"
          >
            <Text style={styles.secondaryButtonText}>새 계정으로 시작</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  highlight: {
    color: colors.accent.primary,
    fontWeight: '600',
  },
  errorText: {
    color: colors.accent.error,
    fontSize: 13,
    marginBottom: 16,
  },
  primaryButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  loadingText: {
    color: colors.text.primary,
    marginTop: 16,
    fontSize: 16,
  },
});
