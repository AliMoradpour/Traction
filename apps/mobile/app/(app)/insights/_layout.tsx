import { Stack } from 'expo-router';

export default function InsightsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="behavioral-awareness" />
      <Stack.Screen name="weekly-review" />
    </Stack>
  );
}
