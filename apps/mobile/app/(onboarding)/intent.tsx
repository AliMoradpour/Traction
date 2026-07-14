import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useOnboardingStore } from '@/store/onboarding.store';
import { Button } from '@/components/ui/Button';

const TOTAL_STEPS = 6;

const OPTIONS = [
  {
    id: 'daily',
    icon: '⚡',
    title: 'Daily Productivity',
    description: 'Master your to-do list and focus on high-impact tasks today.',
  },
  {
    id: 'longterm',
    icon: '🎯',
    title: 'Long-Term Goals',
    description: 'Stay consistent on multi-month projects and strategic milestones.',
  },
  {
    id: 'both',
    icon: '✨',
    title: 'Both',
    description: 'Bridge the gap between daily execution and your grand vision.',
  },
];

export default function OnboardingIntentScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const setIntent = useOnboardingStore((state) => state.setIntent);

  const handleNext = () => {
    if (selected) {
      setIntent(selected);
      router.push('/(onboarding)/behavior-profile');
    }
  };

  const handleBack = () => {
    router.back();
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
                { backgroundColor: theme.colors.accent, width: `${(2 / TOTAL_STEPS) * 100}%` },
              ]}
            />
          </View>
          <Text style={[styles.stepText, { color: theme.colors.textMuted }]}>
            2/{TOTAL_STEPS}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: theme.colors.text }]}>Why Are You Here?</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textMuted }]}>
            Select the primary focus that matches your lifestyle. We'll tailor your experience
            accordingly.
          </Text>
        </View>

        <View style={styles.options}>
          {OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              style={[
                styles.optionCard,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor:
                    selected === option.id ? theme.colors.accent : theme.colors.border,
                },
                selected === option.id && styles.optionCardSelected,
              ]}
              onPress={() => setSelected(option.id)}
            >
              <View style={[styles.optionIcon, { backgroundColor: theme.colors.surfaceMuted }]}>
                <Text style={styles.optionIconText}>{option.icon}</Text>
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: theme.colors.text }]}>
                  {option.title}
                </Text>
                <Text style={[styles.optionDescription, { color: theme.colors.textMuted }]}>
                  {option.description}
                </Text>
              </View>
              <View
                style={[
                  styles.checkCircle,
                  {
                    borderColor: selected === option.id ? theme.colors.accent : theme.colors.border,
                    backgroundColor: selected === option.id ? theme.colors.accent : 'transparent',
                  },
                ]}
              >
                {selected === option.id && <Text style={styles.checkIcon}>✓</Text>}
              </View>
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
        <Text style={[styles.hint, { color: theme.colors.textSubtle }]}>
          You can change this later in settings
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
    gap: 32,
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
  options: {
    gap: 12,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  optionCardSelected: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionIconText: {
    fontSize: 24,
  },
  optionContent: {
    flex: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionDescription: {
    fontSize: 15,
    lineHeight: 20,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
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
  hint: {
    fontSize: 13,
    fontWeight: '500',
  },
});
