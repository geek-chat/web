import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/auth.store';

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
    <View style={styles.container}>
      <Text style={styles.title}>GeekChat</Text>
      <Text style={styles.subtitle}>미니멀 메신저</Text>

      <Pressable style={styles.button} onPress={() => handleDevLogin('Alice')}>
        <Text style={styles.buttonText}>Alice로 로그인 (Dev)</Text>
      </Pressable>
      <Pressable style={styles.button} onPress={() => handleDevLogin('Bob')}>
        <Text style={styles.buttonText}>Bob으로 로그인 (Dev)</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f0f23' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#e0e0e0', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#888', marginBottom: 40 },
  button: { backgroundColor: '#16213e', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 8, marginVertical: 8, minWidth: 240, alignItems: 'center' },
  buttonText: { color: '#e0e0e0', fontSize: 16 },
});
