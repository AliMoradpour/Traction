import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="usage" options={{ headerShown: true, title: 'AI Usage' }} />
      <Stack.Screen name="developer" options={{ headerShown: true, title: 'Developer Settings' }} />
      <Stack.Screen name="invites" options={{ headerShown: true, title: 'Manage Invites' }} />
    </Stack>
  );
}
