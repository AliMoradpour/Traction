import { Stack } from 'expo-router';

export default function GoalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="select" />
      <Stack.Screen name="[goalId]" />
      <Stack.Screen name="[goalId]/projection" />
    </Stack>
  );
}
