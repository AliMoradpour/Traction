import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="introduction" />
      <Stack.Screen name="intent" />
      <Stack.Screen name="behavior-profile" />
      <Stack.Screen name="goal-selection" />
      <Stack.Screen name="goal-feasibility" />
    </Stack>
  );
}
