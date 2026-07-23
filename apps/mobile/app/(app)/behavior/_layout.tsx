import { Stack } from 'expo-router';
import { useTractionTheme } from '@/theme';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

function BackButton() {
  const router = useRouter();
  const theme = useTractionTheme();
  return (
    <Pressable style={styles.backButton} onPress={() => router.back()}>
      <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
    </Pressable>
  );
}

export default function BehaviorLayout() {
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
      <Stack.Screen name="daily" />
      <Stack.Screen name="weekly" />
      <Stack.Screen name="indicators" />
      <Stack.Screen name="burnout" />
      <Stack.Screen name="procrastination" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
});
