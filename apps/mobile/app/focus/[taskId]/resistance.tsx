import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import Button from '@/components/ui/Button';

const RESISTANCE_REASONS = [
  { id: '1', label: 'Task feels too large', icon: '📏' },
  { id: '2', label: "I don't know where to start", icon: '🤔' },
  { id: '3', label: 'Low energy', icon: '😴' },
  { id: '4', label: 'Distracted', icon: '💭' },
  { id: '5', label: 'Not interested', icon: '😐' },
];

const AI_RECOMMENDATIONS: Record<string, { title: string; steps: string[] }> = {
  '1': {
    title: 'Break it down',
    steps: [
      'Identify the smallest possible first step',
      'Set a 5-minute timer for just that step',
      'Commit to nothing more than starting',
    ],
  },
  '2': {
    title: 'Start messy',
    steps: [
      'Open the document or tool',
      'Write one sentence, no matter how bad',
      'Let momentum build from there',
    ],
  },
  '3': {
    title: 'Match energy to task',
    steps: [
      'Take a 2-minute breathing break',
      'Switch to a low-energy variant',
      'Or postpone to your next energy peak',
    ],
  },
  '4': {
    title: 'Reset focus',
    steps: [
      'Close all unnecessary tabs',
      'Put your phone in another room',
      'Restart timer for 10 focus minutes',
    ],
  },
  '5': {
    title: 'Connect to purpose',
    steps: [
      'Remind yourself why this matters',
      'Link completion to a reward',
      'Consider if this task is truly necessary',
    ],
  },
};

export default function ResistanceScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);

  const recommendation = selectedReason ? AI_RECOMMENDATIONS[selectedReason] : null;

  const handleSelect = (reasonId: string) => {
    setSelectedReason(reasonId);
  };

  const handleApply = () => {
    // TODO: Apply recommendation and return to focus session
    router.back();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Text style={[styles.backButton, { color: theme.colors.primary }]}>← Back</Text>
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Resistance Flow</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!selectedReason ? (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What's blocking you?</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Select the friction you're experiencing right now
              </Text>
            </View>

            <View style={styles.reasonList}>
              {RESISTANCE_REASONS.map((reason) => (
                <Pressable
                  key={reason.id}
                  style={[styles.reasonCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  onPress={() => handleSelect(reason.id)}
                >
                  <Text style={styles.reasonIcon}>{reason.icon}</Text>
                  <Text style={[styles.reasonLabel, { color: theme.colors.text }]}>{reason.label}</Text>
                  <Text style={[styles.reasonArrow, { color: theme.colors.textSubtle }]}>›</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{recommendation?.title}</Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Here's a personalized approach to overcome this friction
              </Text>
            </View>

            <View style={[styles.recommendationCard, { backgroundColor: theme.colors.accentMuted }]}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationIcon}>✨</Text>
                <Text style={[styles.recommendationTitle, { color: theme.colors.accentText }]}>AI Recommendation</Text>
              </View>
              <View style={styles.stepsList}>
                {recommendation?.steps.map((step, index) => (
                  <View key={index} style={styles.stepItem}>
                    <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.stepNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={[styles.stepText, { color: theme.colors.accentText }]}>{step}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.actions}>
              <Button variant="primary" onPress={handleApply}>
                Apply & Return
              </Button>
              <Pressable onPress={() => setSelectedReason(null)}>
                <Text style={[styles.tryAgain, { color: theme.colors.textMuted }]}>Try a different approach</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    fontSize: 15,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 15,
    lineHeight: 20,
  },
  reasonList: {
    gap: 12,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  reasonIcon: {
    fontSize: 24,
  },
  reasonLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  reasonArrow: {
    fontSize: 24,
  },
  recommendationCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  recommendationIcon: {
    fontSize: 20,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepsList: {
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  actions: {
    gap: 16,
    alignItems: 'center',
  },
  tryAgain: {
    fontSize: 14,
    fontWeight: '500',
  },
});
