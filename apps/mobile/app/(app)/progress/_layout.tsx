import { Stack } from 'expo-router';

import { useTractionTheme } from '@/theme';

// Progress hub plus its detail areas (suggestions, habits, momentum), so the
// Progress tab stays selected while you browse them.
export default function ProgressLayout() {
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
      <Stack.Screen name="insights" />
      <Stack.Screen name="behavior" />
      <Stack.Screen name="execution" />
    </Stack>
  );
}
