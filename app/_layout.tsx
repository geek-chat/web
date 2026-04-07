import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/store/auth.store';
import LoadingSpinner from '../src/components/LoadingSpinner';
import { colors } from '../src/theme';

export default function RootLayout() {
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const restoreAuth = useAuthStore((s) => s.restoreAuth);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <LoadingSpinner />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.bg.secondary },
          headerTintColor: colors.text.primary,
          contentStyle: { backgroundColor: colors.bg.primary },
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
