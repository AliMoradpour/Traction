import { Stack } from 'expo-router';

export default function GoalsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="create" />
      <Stack.Screen name="select" />
      <Stack.Screen name="feasibility" />
      <Stack.Screen name="[goalId]/index" />
      <Stack.Screen name="[goalId]/edit" />
      <Stack.Screen name="[goalId]/milestones" />
      <Stack.Screen name="[goalId]/projection" />
      <Stack.Screen name="[goalId]/analytics" />
      <Stack.Screen name="[goalId]/recovery" />
    </Stack>
  );
}
