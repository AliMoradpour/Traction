import { useLocalSearchParams,useRouter } from 'expo-router';
import { useEffect,useState } from 'react';
import { ActivityIndicator,Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { apiClient } from '@/api/client';
import { endpoints } from '@/api/endpoints';
import { Button } from '@/components/ui/Button';
import { useGoal } from '@/hooks/useGoals';
import { useTractionTheme } from '@/theme';

interface RecoveryStrategy {
  title: string;
  description: string;
}

interface RecoveryData {
  realityCheck?: string;
  recoveryStrategy?: RecoveryStrategy[];
  consequences?: string;
  shouldModifyGoal?: boolean;
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical';
  modifiedGoal?: string;
}

const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  low: { bg: '#E5F0E8', text: '#4C7A5C', border: '#A7F3D0' },
  medium: { bg: '#FAEBE1', text: '#B5663A', border: '#FDE68A' },
  high: { bg: '#FFEDD5', text: '#9A3412', border: '#FED7AA' },
  critical: { bg: '#FBE6E3', text: '#991B1B', border: '#FECACA' },
};

export default function GoalRecoveryScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: goal, isLoading: goalLoading } = useGoal(goalId || '');

  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!goalId) return;
    setLoading(true);
    setError(null);
    apiClient
      .post(endpoints.ai.goalRecovery(goalId))
      .then((res) => {
        setRecoveryData(res.data);
      })
      .catch(() => {
        setError('Unable to analyze recovery options right now. You can still adjust your goal manually below.');
      })
      .finally(() => setLoading(false));
  }, [goalId]);

  if (goalLoading || loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>
            Analyzing your goal...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Recovery Plan</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const urgencyLevel = recoveryData?.urgencyLevel || 'medium';
  const urgencyStyle = URGENCY_COLORS[urgencyLevel] || URGENCY_COLORS.medium;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Recovery Plan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.urgencyBanner, { backgroundColor: urgencyStyle.bg, borderColor: urgencyStyle.border }]}>
          <Text style={[styles.urgencyLabel, { color: urgencyStyle.text }]}>
            {urgencyLevel.toUpperCase()} URGENCY
          </Text>
        </View>

        {recoveryData?.realityCheck && (
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Reality Check</Text>
            <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>{recoveryData.realityCheck}</Text>
          </View>
        )}

        {recoveryData?.recoveryStrategy && recoveryData.recoveryStrategy.length > 0 && (
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Recovery Strategies</Text>
            {recoveryData.recoveryStrategy.map((strategy, index) => (
              <View key={index} style={[styles.strategyItem, { borderColor: theme.colors.borderMuted }]}>
                <Text style={[styles.strategyTitle, { color: theme.colors.text }]}>{strategy.title}</Text>
                <Text style={[styles.strategyDesc, { color: theme.colors.textMuted }]}>{strategy.description}</Text>
              </View>
            ))}
          </View>
        )}

        {recoveryData?.consequences && (
          <View style={[styles.card, { backgroundColor: theme.colors.dangerSurface, borderColor: '#FBE6E3' }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.dangerText }]}>What Happens If Nothing Changes</Text>
            <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>{recoveryData.consequences}</Text>
          </View>
        )}

        {recoveryData?.shouldModifyGoal && recoveryData?.modifiedGoal && (
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.accent }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Suggested Goal Adjustment</Text>
            <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>{recoveryData.modifiedGoal}</Text>
          </View>
        )}

        {error && (
          <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Manual Recovery Options</Text>
            <Text style={[styles.cardText, { color: theme.colors.textMuted }]}>{error}</Text>
          </View>
        )}

        <View style={[styles.card, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Quick Adjustments</Text>

          <View style={[styles.optionItem, { borderColor: theme.colors.borderMuted }]}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Adjust Deadline</Text>
            <Text style={[styles.optionDesc, { color: theme.colors.textMuted }]}>
              Extending your timeline gives you more breathing room. This is a practical choice when external factors have slowed progress.
            </Text>
          </View>

          <View style={[styles.optionItem, { borderColor: theme.colors.borderMuted }]}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Reduce Scope</Text>
            <Text style={[styles.optionDesc, { color: theme.colors.textMuted }]}>
              Focusing on the most important milestones helps you build momentum. You can always expand the goal later.
            </Text>
          </View>

          <View style={[styles.optionItem, { borderColor: theme.colors.borderMuted }]}>
            <Text style={[styles.optionTitle, { color: theme.colors.text }]}>Increase Weekly Hours</Text>
            <Text style={[styles.optionDesc, { color: theme.colors.textMuted }]}>
              Adding more focused time each week can accelerate progress. Even 1-2 extra hours can make a meaningful difference.
            </Text>
          </View>
        </View>

        <Button
          variant="secondary"
          title="Go to Analytics"
          onPress={() => router.push(`/(app)/goals/${goalId}/analytics` as any)}
        />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 15,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  urgencyBanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  urgencyLabel: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.05,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    lineHeight: 22,
  },
  strategyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  strategyTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  strategyDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  optionItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 4,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  optionDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
});
