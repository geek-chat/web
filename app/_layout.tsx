import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/theme';

export default function RootLayout() {
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
