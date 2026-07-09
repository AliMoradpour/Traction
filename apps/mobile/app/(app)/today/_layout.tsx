import { Stack } from 'expo-router';

export default function TodayLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="daily-brief" />
      <Stack.Screen name="reflection" />
    </Stack>
  );
}
