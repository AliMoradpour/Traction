import { Stack } from 'expo-router';

export default function FocusLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="[taskId]" />
      <Stack.Screen name="[taskId]/resistance" />
      <Stack.Screen name="[taskId]/simplify" />
    </Stack>
  );
}
