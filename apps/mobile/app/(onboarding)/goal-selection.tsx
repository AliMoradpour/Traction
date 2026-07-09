import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useOnboardingStore } from '@/store/onboarding.store';
import Button from '@/components/ui/Button';

const TOTAL_STEPS = 6;

const GOAL_TEMPLATES = [
  {
    id: 'productivity',
    icon: '⚡',
    title: 'Daily Productivity',
    description: 'Focus on completing tasks efficiently',
  },
  {
    id: 'fitness',
    icon: '💪',
    title: 'Health & Fitness',
    description: 'Build sustainable exercise habits',
  },
  {
    id: 'learning',
    icon: '📚',
    title: 'Learning & Growth',
    description: 'Develop new skills and knowledge',
  },
  {
    id: 'creative',
    icon: '🎨',
    title: 'Creative Projects',
    description: 'Ship creative work consistently',
  },
  {
    id: 'career',
    icon: '🚀',
    title: 'Career Advancement',
    description: 'Achieve professional milestones',
  },
  {
    id: 'custom',
    icon: '✨',
    title: 'Custom Goal',
    description: 'Create your own from scratch',
  },
];

export default function OnboardingGoalSelectionScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const setGoalTemplate = useOnboardingStore((state) => state.setGoalTemplate);

  const handleNext = () => {
    if (selected) {
      setGoalTemplate(selected);
      router.push('/(onboarding)/goal-feasibility');
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSkip = () => {
    router.replace('/(app)/today');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: theme.colors.textMuted }]}>← Back</Text>
        </Pressable>

        <View style={styles.progressContainer}>
          <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.colors.accent, width: `${(4 / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.stepText, { color: theme.colors.textMuted }]}>
            4/{TOTAL_STEPS}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            What Do You Want to Achieve?
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Select a goal template or create your own. You can always add more later.
          </Text>
        </View>

        <View style={styles.goalsGrid}>
          {GOAL_TEMPLATES.map((goal) => (
            <Pressable
              key={goal.id}
              style={[
                styles.goalCard,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: selected === goal.id ? theme.colors.accent : theme.colors.border,
                },
                selected === goal.id && styles.goalCardSelected,
              ]}
              onPress={() => setSelected(goal.id)}
            >
              <Text style={styles.goalIcon}>{goal.icon}</Text>
              <Text style={[styles.goalTitle, { color: theme.colors.text }]}>{goal.title}</Text>
              <Text style={[styles.goalDescription, { color: theme.colors.textMuted }]}>
                {goal.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          variant="primary"
          size="lg"
          onPress={handleNext}
          disabled={!selected}
          style={[styles.continueButton, !selected && styles.continueButtonDisabled]}
        >
          Continue
        </Button>
        <Pressable onPress={handleSkip} style={styles.skipButton}>
          <Text style={[styles.skipText, { color: theme.colors.textSubtle }]}>
            Skip for now
          </Text>
        </Pressable>
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
  backButton: {
    marginBottom: 16,
  },
  backText: {
    fontSize: 15,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepText: {
    fontSize: 13,
    fontWeight: '500',
    minWidth: 32,
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 24,
  },
  titleContainer: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.01,
  },
  subtitle: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  goalCard: {
    width: '48%',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  goalCardSelected: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  goalIcon: {
    fontSize: 32,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
  goalDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  continueButton: {
    width: '100%',
    marginBottom: 12,
  },
  continueButtonDisabled: {
    opacity: 0.3,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
