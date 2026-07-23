import { View, Text, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { useGoals } from '@/hooks/useGoals';
import type { Goal, GoalHealth, GoalType } from '@/services/goal.service';
import { LoadingSpinner } from '@/components/feedback/LoadingStates';

const TYPE_COLORS: Record<GoalType, string> = {
  IELTS: '#8B5CF6',
  PROGRAMMING: '#3B82F6',
  FITNESS: '#10B981',
  SAVINGS: '#F59E0B',
  CUSTOM: '#6B7280',
};

const HEALTH_COLORS: Record<GoalHealth, string> = {
  ON_TRACK: '#10B981',
  SLIGHTLY_BEHIND: '#F59E0B',
  BEHIND_SCHEDULE: '#F97316',
  RECOVERY_NEEDED: '#EF4444',
  AT_RISK: '#EF4444',
};

const HEALTH_LABELS: Record<GoalHealth, string> = {
  ON_TRACK: 'On Track',
  SLIGHTLY_BEHIND: 'Slightly Behind',
  BEHIND_SCHEDULE: 'Behind Schedule',
  RECOVERY_NEEDED: 'Recovery Needed',
  AT_RISK: 'At Risk',
};

function getDaysRemaining(targetDate?: string): number | null {
  if (!targetDate) return null;
  const diff = new Date(targetDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function GoalsScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const { data: goals, isLoading, isError, refetch, isRefetching } = useGoals();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner message="Loading goals..." />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: theme.colors.danger }]}>
            Failed to load goals.
          </Text>
          <Pressable
            style={[styles.retryBtn, { backgroundColor: theme.colors.primary }]}
            onPress={() => refetch()}
          >
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const activeGoals = goals ?? [];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Goals</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            style={[styles.iconButton, { backgroundColor: theme.colors.surfaceElevated }]}
            onPress={() => router.push('/(app)/goals/create')}
          >
            <Text style={[styles.iconText, { color: theme.colors.text }]}>+</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <View style={styles.summarySection}>
          <Text style={[styles.summaryLabel, { color: theme.colors.primary }]}>ACTIVE FOCUS</Text>
          <Text style={[styles.summaryTitle, { color: theme.colors.text }]}>
            You have {activeGoals.length} goal{activeGoals.length !== 1 ? 's' : ''} in progress.
          </Text>
        </View>

        {activeGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyIcon, { color: theme.colors.textMuted }]}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No goals yet</Text>
            <Text style={[styles.emptySubtitle, { color: theme.colors.textMuted }]}>
              Create your first goal to get started.
            </Text>
            <Pressable
              style={[styles.createBtn, { backgroundColor: theme.colors.primary }]}
              onPress={() => router.push('/(app)/goals/create')}
            >
              <Text style={styles.createBtnText}>Create Goal</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {activeGoals.map((goal) => {
              const typeColor = TYPE_COLORS[goal.type] ?? TYPE_COLORS.CUSTOM;
              const healthColor = HEALTH_COLORS[goal.health] ?? HEALTH_COLORS.ON_TRACK;
              const healthLabel = HEALTH_LABELS[goal.health] ?? goal.health;
              const daysRemaining = getDaysRemaining(goal.targetDate);

              return (
                <Pressable
                  key={goal.id}
                  style={[
                    styles.goalCard,
                    { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  ]}
                  onPress={() => router.push(`/(app)/goals/${goal.id}`)}
                >
                  <View style={styles.goalHeader}>
                    <Text style={[styles.goalTitle, { color: theme.colors.text }]} numberOfLines={1}>
                      {goal.title}
                    </Text>
                    <View style={[styles.typeBadge, { backgroundColor: typeColor }]}>
                      <Text style={styles.typeBadgeText}>{goal.type}</Text>
                    </View>
                  </View>

                  <View style={[styles.healthRow, { backgroundColor: `${healthColor}18` }]}>
                    <View style={[styles.healthDot, { backgroundColor: healthColor }]} />
                    <Text style={[styles.healthText, { color: healthColor }]}>{healthLabel}</Text>
                  </View>

                  <View style={styles.progressSection}>
                    <View style={[styles.progressTrack, { backgroundColor: theme.colors.surfaceMuted }]}>
                      <View
                        style={[
                          styles.progressFill,
                          { backgroundColor: typeColor, width: `${goal.progress}%` },
                        ]}
                      />
                    </View>
                    <Text style={[styles.progressPercent, { color: theme.colors.textMuted }]}>
                      {goal.progress}%
                    </Text>
                  </View>

                  {goal.targetDate && (
                    <Text style={[styles.metaText, { color: theme.colors.textMuted }]}>
                      {daysRemaining !== null && daysRemaining >= 0
                        ? `${daysRemaining} days remaining`
                        : `Due ${goal.targetDate}`}
                    </Text>
                  )}
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          onPress={() => router.push('/(app)/goals/create')}
        >
          <Text style={styles.fabText}>+ New Goal</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  summarySection: {
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.1,
    marginBottom: 4,
  },
  summaryTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  goalsList: {
    gap: 16,
  },
  goalCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  healthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 36,
    textAlign: 'right',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    marginBottom: 24,
  },
  createBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
