import { useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const TOTAL_STEPS = 4;

export default function OnboardingIntroductionScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }).start();

  const handleNext = () => {
    router.push('/(onboarding)/intent');
  };

  const handleSkip = () => {
    router.replace('/(app)/today');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.colors.primary, width: `${(1 / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.stepText, { color: theme.colors.textMuted }]}>
              STEP 1 OF {TOTAL_STEPS}
            </Text>
            <Pressable onPress={handleSkip}>
              <Text style={[styles.skipText, { color: theme.colors.textSubtle }]}>Skip</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarIcon}>✨</Text>
        </View>

        <View style={[styles.messageBubble, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[styles.messageText, { color: theme.colors.text }]}>
            Hello! I'm Traction.
          </Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          Traction helps you execute meaningful work and reduce procrastination.
        </Text>

        <View style={[styles.descriptionCard, { backgroundColor: theme.colors.surfaceMuted }]}>
          <Text style={[styles.descriptionText, { color: theme.colors.textMuted }]}>
            In a world of constant noise, we prioritize clarity. I'll assist you in cutting through
            the clutter to focus on what actually moves the needle.
          </Text>
        </View>

        <View style={styles.features}>
          <View style={[styles.featureCard, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={styles.featureIcon}>🎯</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.text }]}>
              Intentional Focus
            </Text>
          </View>
          <View style={[styles.featureCard, styles.featureCardAccent, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={[styles.featureTitle, { color: theme.colors.textInverse }]}>
              High Velocity
            </Text>
          </View>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Button variant="primary" size="lg" onPress={handleNext} style={styles.nextButton}>
          Next →
        </Button>
        <Text style={[styles.hint, { color: theme.colors.textSubtle }]}>
          Press Enter to continue
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    textTransform: 'uppercase',
  },
  skipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 24,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarIcon: {
    fontSize: 24,
  },
  messageBubble: {
    alignSelf: 'flex-start',
    padding: 16,
    borderRadius: 16,
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 34,
    letterSpacing: -0.01,
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 16,
  },
  descriptionText: {
    fontSize: 17,
    lineHeight: 24,
  },
  features: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  featureCardAccent: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  featureIcon: {
    fontSize: 28,
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  nextButton: {
    width: '100%',
    marginBottom: 12,
  },
  hint: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
});
