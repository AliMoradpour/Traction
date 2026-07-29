import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useGoal, useGoalMilestones, useGoalHealth } from '@/hooks/useGoals';
import { Button } from '@/components/ui/Button';

function calcWeeksElapsed(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return Math.max(1, diffDays / 7);
}

function calcMonthsElapsed(startDate: string): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.max(1, Math.ceil((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  return Math.max(1, diffDays / 30);
}

export default function GoalAnalyticsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const { data: goal, isLoading: goalLoading, isError: goalError, refetch: refetchGoal } = useGoal(goalId || '');
  const { data: milestones, isLoading: milestonesLoading, isError: milestonesError, refetch: refetchMilestones } = useGoalMilestones(goalId || '');
  const { data: health, isLoading: healthLoading, isError: healthError, refetch: refetchHealth } = useGoalHealth(goalId || '');

  const isLoading = goalLoading || milestonesLoading || healthLoading;
  const isError = goalError || milestonesError || healthError;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            Failed to load data
          </Text>
          <Button variant="secondary" onPress={() => { refetchGoal(); refetchMilestones(); refetchHealth(); }} style={{ marginTop: 12 }}>
            Retry
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!goal) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Analytics</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>Goal not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completedMilestones = milestones?.filter((m) => m.status === 'COMPLETED') || [];
  const totalMilestones = milestones?.length || 0;
  const completedMilestoneCount = completedMilestones.length;
  const remainingMilestones = totalMilestones - completedMilestoneCount;

  const weeksElapsed = calcWeeksElapsed(goal.startDate);
  const monthsElapsed = calcMonthsElapsed(goal.startDate);

  const weeklyConsistency = weeksElapsed > 0 ? (completedMilestoneCount / weeksElapsed).toFixed(1) : '0';
  const milestoneVelocity = monthsElapsed > 0 ? (completedMilestoneCount / monthsElapsed).toFixed(1) : '0';

  const completionPercentage = goal.progress;

  const velocity = goal.velocity || 'STABLE';
  const velocityTrend =
    velocity === 'INCREASING'
      ? { label: 'Increasing', icon: '↑', color: '#10B981' }
      : velocity === 'DECREASING'
      ? { label: 'Decreasing', icon: '↓', color: '#EF4444' }
      : { label: 'Stable', icon: '→', color: '#F59E0B' };

  const healthScore = health?.score ?? null;

  const statCards = [
    {
      label: 'COMPLETION',
      value: `${completionPercentage}%`,
      icon: '◉',
      color: completionPercentage >= 70 ? '#10B981' : completionPercentage >= 40 ? '#F59E0B' : '#EF4444',
    },
    {
      label: 'WEEKLY AVG',
      value: weeklyConsistency,
      sublabel: 'milestones/wk',
      icon: '↻',
      color: '#3B82F6',
    },
    {
      label: 'MONTHLY VELOCITY',
      value: milestoneVelocity,
      sublabel: 'milestones/mo',
      icon: '⚡',
      color: '#8B5CF6',
    },
    {
      label: 'MILESTONES LEFT',
      value: `${remainingMilestones}`,
      sublabel: `of ${totalMilestones} total`,
      icon: '◎',
      color: '#F59E0B',
    },
    {
      label: 'PROGRESS TREND',
      value: velocityTrend.label,
      icon: velocityTrend.icon,
      color: velocityTrend.color,
    },
    {
      label: 'HEALTH SCORE',
      value: healthScore !== null ? `${healthScore}` : goal.health.replace(/_/g, ' '),
      icon: '♥',
      color:
        goal.health === 'ON_TRACK'
          ? '#10B981'
          : goal.health === 'SLIGHTLY_BEHIND'
          ? '#F59E0B'
          : goal.health === 'BEHIND_SCHEDULE'
          ? '#F97316'
          : '#EF4444',
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Analytics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.heroCard}>
          <Text style={[styles.heroValue, { color: theme.colors.text }]}>{completionPercentage}%</Text>
          <Text style={[styles.heroLabel, { color: theme.colors.textMuted }]}>Goal Completion</Text>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <View
              key={stat.label}
              style={[styles.statCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            >
              <View style={[styles.statIconWrap, { backgroundColor: stat.color + '18' }]}>
                <Text style={[styles.statIcon, { color: stat.color }]}>{stat.icon}</Text>
              </View>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>{stat.label}</Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>{stat.value}</Text>
              {stat.sublabel ? (
                <Text style={[styles.statSublabel, { color: theme.colors.textSubtle }]}>{stat.sublabel}</Text>
              ) : null}
            </View>
          ))}
        </View>

        {health && (
          <View style={[styles.healthCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Health Breakdown</Text>
            {health.consistency !== undefined && (
              <View style={styles.healthRow}>
                <Text style={[styles.healthLabel, { color: theme.colors.textMuted }]}>Consistency</Text>
                <Text style={[styles.healthValue, { color: theme.colors.text }]}>{health.consistency}%</Text>
              </View>
            )}
            {health.momentum !== undefined && (
              <View style={styles.healthRow}>
                <Text style={[styles.healthLabel, { color: theme.colors.textMuted }]}>Momentum</Text>
                <Text style={[styles.healthValue, { color: theme.colors.text }]}>{health.momentum}%</Text>
              </View>
            )}
            {health.overallHealth !== undefined && (
              <View style={styles.healthRow}>
                <Text style={[styles.healthLabel, { color: theme.colors.textMuted }]}>Overall</Text>
                <Text style={[styles.healthValue, { color: theme.colors.text }]}>{health.overallHealth}%</Text>
              </View>
            )}
          </View>
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
    paddingVertical: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    gap: 6,
  },
  heroValue: {
    fontSize: 56,
    fontWeight: '800',
  },
  heroLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statIcon: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statSublabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  healthCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  healthLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  healthValue: {
    fontSize: 16,
    fontWeight: '600',
  },
});
