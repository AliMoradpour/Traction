import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useGoal, useGoalProjection } from '@/hooks/useGoals';
import { ProgressBar } from '@/components/ui/ProgressBar';

function formatDate(dateString?: string): string {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function calcDaysElapsed(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  return Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function calcDaysRemaining(targetDate?: string): number | null {
  if (!targetDate) return null;
  const target = new Date(targetDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function GoalProjectionScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: goal, isLoading: goalLoading } = useGoal(goalId || '');
  const { data: projection, isLoading: projLoading } = useGoalProjection(goalId || '');

  const isLoading = goalLoading || projLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Projection</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysElapsed = calcDaysElapsed(goal.startDate);
  const daysRemaining = calcDaysRemaining(goal.targetDate);
  const totalDays = goal.targetDate
    ? Math.ceil(
        (new Date(goal.targetDate).getTime() - new Date(goal.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;
  const expectedProgress = totalDays ? Math.min(100, Math.round((daysElapsed / totalDays) * 100)) : null;
  const weeklyPace = daysElapsed > 0 ? ((goal.progress / daysElapsed) * 7).toFixed(1) : '0';

  const displayHealth = projection?.health || goal.health;
  const displayForecast =
    projection?.forecast ||
    (daysRemaining !== null && totalDays
      ? daysRemaining < 0
        ? `Target date has passed. You are ${Math.abs(daysRemaining)} days overdue.`
        : `At current pace, you should complete by the target date.`
      : 'Insufficient data for projection.');

  const displayAlternative =
    projection?.alternativeScenario ||
    (expectedProgress !== null
      ? goal.progress >= expectedProgress
        ? 'You are ahead of schedule. Keep up the good work!'
        : `You need to increase your weekly pace to ${((100 - goal.progress) / Math.max(1, (daysRemaining || 1) / 7)).toFixed(1)}% per week to meet the target.`
      : '');

  const isOnTrack = displayHealth === 'ON_TRACK' || displayHealth === 'SLIGHTLY_BEHIND';
  const healthColor =
    displayHealth === 'ON_TRACK'
      ? '#10B981'
      : displayHealth === 'SLIGHTLY_BEHIND'
      ? '#F59E0B'
      : displayHealth === 'BEHIND_SCHEDULE'
      ? '#F97316'
      : '#EF4444';

  const projectedDate = projection?.targetDate || goal.targetDate;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Projection</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <View style={[styles.heroIcon, { backgroundColor: healthColor + '20' }]}>
            <Text style={[styles.heroIconText, { color: healthColor }]}>
              {isOnTrack ? '✓' : '!'}
            </Text>
          </View>
          <Text style={[styles.heroTitle, { color: theme.colors.text }]}>
            {isOnTrack ? 'On Track' : 'Needs Attention'}
          </Text>
          <Text style={[styles.heroHealth, { color: healthColor }]}>
            {displayHealth.replace(/_/g, ' ')}
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: theme.colors.textMuted }]}>Current Progress</Text>
            <Text style={[styles.progressValue, { color: theme.colors.text }]}>{goal.progress}%</Text>
          </View>
          <ProgressBar value={goal.progress} tone={isOnTrack ? 'success' : 'warning'} height={8} />
          {expectedProgress !== null && (
            <View style={styles.expectedRow}>
              <Text style={[styles.expectedLabel, { color: theme.colors.textSubtle }]}>Expected at this point</Text>
              <Text style={[styles.expectedValue, { color: theme.colors.textMuted }]}>{expectedProgress}%</Text>
            </View>
          )}
        </View>

        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Days Elapsed</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{daysElapsed}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Days Remaining</Text>
            <Text style={[styles.statValue, { color: daysRemaining !== null && daysRemaining < 0 ? theme.colors.danger : theme.colors.text }]}>
              {daysRemaining !== null ? daysRemaining : '—'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Weekly Pace</Text>
            <Text style={[styles.statValue, { color: theme.colors.text }]}>{weeklyPace}%</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>Projected Date</Text>
            <Text style={[styles.statValue, { color: theme.colors.text, fontSize: 14 }]}>
              {projectedDate ? formatDate(projectedDate) : '—'}
            </Text>
          </View>
        </View>

        <View style={styles.forecastCard}>
          <Text style={[styles.forecastTitle, { color: theme.colors.text }]}>Forecast</Text>
          <Text style={[styles.forecastText, { color: theme.colors.textMuted }]}>{displayForecast}</Text>
        </View>

        {displayAlternative ? (
          <View style={styles.forecastCard}>
            <Text style={[styles.forecastTitle, { color: theme.colors.text }]}>Recommendation</Text>
            <Text style={[styles.forecastText, { color: theme.colors.textMuted }]}>{displayAlternative}</Text>
          </View>
        ) : null}
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
  },
  errorText: {
    fontSize: 17,
    fontWeight: '500',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroIconText: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  heroHealth: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    gap: 10,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  expectedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expectedLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  expectedValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  forecastCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.02)',
    gap: 8,
  },
  forecastTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  forecastText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
