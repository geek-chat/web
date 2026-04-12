import { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useAuthStore } from '../../src/store/auth.store';
import { setUsername } from '../../src/api/users';
import { colors } from '../../src/theme';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/;

export default function SetupUsernameScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);

  const [username, setUsernameInput] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = USERNAME_PATTERN.test(username);

  const handleSubmit = async () => {
    if (!isValid || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await setUsername(username);
      if (user) {
        setUser({ ...user, username: result.username });
      }
      router.replace('/(app)/rooms');
    } catch (err) {
      if (err instanceof Error && err.message.includes('409')) {
        setError('이미 사용 중인 username입니다');
      } else {
        setError('설정에 실패했습니다. 다시 시도해주세요');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getValidationMessage = (): string => {
    if (username.length === 0) {
      return '';
    }
    if (username.length < 3) {
      return '3자 이상 입력해주세요';
    }
    if (username.length > 20) {
      return '20자 이하로 입력해주세요';
    }
    if (!USERNAME_PATTERN.test(username)) {
      return '영문 소문자, 숫자, 밑줄(_)만 사용 가능합니다';
    }
    return '';
  };

  const validationMessage = getValidationMessage();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Username 설정',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Username을 설정하세요</Text>
          <Text style={styles.description}>
            다른 사용자가 당신을 찾을 수 있는 고유 ID입니다.{'\n'}
            영문 소문자, 숫자, 밑줄(_)만 사용 가능합니다.
          </Text>

          <View style={styles.inputWrapper}>
            <Text style={styles.atPrefix}>@</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={(text) => {
                setUsernameInput(text.toLowerCase());
                setError('');
              }}
              placeholder="username"
              placeholderTextColor={colors.text.placeholder}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              autoFocus
              accessibilityLabel="Username 입력"
            />
          </View>

          {validationMessage.length > 0 && (
            <Text style={styles.validationText}>{validationMessage}</Text>
          )}

          {error.length > 0 && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <Pressable
            style={[
              styles.submitButton,
              (!isValid || isSubmitting) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isValid || isSubmitting}
            accessibilityRole="button"
            accessibilityLabel="Username 설정 완료"
            testID="submit-username-button"
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '설정 중...' : '설정 완료'}
            </Text>
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
    paddingHorizontal: 24,
  },
  content: {
    alignItems: 'center',
  },
  title: {
    color: colors.text.primary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.input,
    borderRadius: 10,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 320,
  },
  atPrefix: {
    color: colors.text.secondary,
    fontSize: 18,
    fontWeight: '600',
    marginRight: 4,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 18,
    paddingVertical: 14,
  },
  validationText: {
    color: colors.accent.warning,
    fontSize: 13,
    marginTop: 8,
  },
  errorText: {
    color: colors.accent.error,
    fontSize: 13,
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: colors.accent.primary,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.4,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
