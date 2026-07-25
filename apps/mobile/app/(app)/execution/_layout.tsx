import { Stack } from 'expo-router';
import { useTractionTheme } from '@/theme';

export default function ExecutionLayout() {
  const theme = useTractionTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="momentum" />
      <Stack.Screen name="resistance" />
      <Stack.Screen name="coaching" />
    </Stack>
  );
}
