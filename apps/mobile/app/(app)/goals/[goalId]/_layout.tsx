import { Stack } from 'expo-router';

export default function GoalDetailLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="edit" />
      <Stack.Screen name="milestones" />
      <Stack.Screen name="projection" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="recovery" />
    </Stack>
  );
}
