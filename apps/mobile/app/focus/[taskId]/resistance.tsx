import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { aiService, behaviorService } from '@/services';

const RESISTANCE_REASONS = [
  { id: '1', label: 'Task feels too large', icon: '📏', value: 'Task feels too large' },
  { id: '2', label: "I don't know where to start", icon: '🤔', value: "I don't know where to start" },
  { id: '3', label: 'Low energy', icon: '😴', value: 'Low energy' },
  { id: '4', label: 'Distracted', icon: '💭', value: 'Distracted' },
  { id: '5', label: 'Not interested', icon: '😐', value: 'Not interested' },
];

interface AnalysisResult {
  title: string;
  steps: string[];
}

export default function ResistanceScreen() {
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const theme = useTractionTheme();
  const router = useRouter();
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

  const handleSelect = useCallback(async (reasonId: string) => {
    const reason = RESISTANCE_REASONS.find((r) => r.id === reasonId);
    if (!reason) return;

    setSelectedReason(reasonId);
    setIsLoadingAnalysis(true);

    behaviorService.track({
      type: 'WHY_AM_I_STUCK',
      taskId,
      metadata: reason.value,
    });

    try {
      const result = await aiService.stuckAnalysis(reason.value, taskId);
      if (result && result.title) {
        setAnalysis(result);
      } else {
        setAnalysis(null);
      }
    } catch {
      setAnalysis(null);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [taskId]);

  const selectedReasonData = RESISTANCE_REASONS.find((r) => r.id === selectedReason);

  const handleApply = () => {
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
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {analysis?.title ?? selectedReasonData?.label ?? 'Recommendation'}
              </Text>
              <Text style={[styles.sectionSubtitle, { color: theme.colors.textMuted }]}>
                Here's a personalized approach to overcome this friction
              </Text>
            </View>

            {isLoadingAnalysis ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing...</Text>
              </View>
            ) : analysis?.steps ? (
              <View style={[styles.recommendationCard, { backgroundColor: theme.colors.accentMuted }]}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationIcon}>✨</Text>
                  <Text style={[styles.recommendationTitle, { color: theme.colors.accentText }]}>AI Recommendation</Text>
                </View>
                <View style={styles.stepsList}>
                  {analysis.steps.map((step, index) => (
                    <View key={index} style={styles.stepItem}>
                      <View style={[styles.stepNumber, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={[styles.stepText, { color: theme.colors.accentText }]}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View style={[styles.recommendationCard, { backgroundColor: theme.colors.accentMuted }]}>
                <View style={styles.recommendationHeader}>
                  <Text style={styles.recommendationIcon}>💡</Text>
                  <Text style={[styles.recommendationTitle, { color: theme.colors.accentText }]}>Tip</Text>
                </View>
                <Text style={[styles.tipText, { color: theme.colors.accentText }]}>
                  You selected: {selectedReasonData?.label}. Take a moment to breathe, then try the smallest possible action.
                </Text>
              </View>
            )}

            <View style={styles.actions}>
              <Button variant="primary" onPress={handleApply}>
                Apply & Return
              </Button>
              <Pressable onPress={() => { setSelectedReason(null); setAnalysis(null); }}>
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
  loadingState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 15,
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
  tipText: {
    fontSize: 15,
    lineHeight: 22,
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
