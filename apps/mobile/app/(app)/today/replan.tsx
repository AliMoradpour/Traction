import { useRef, useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTasks, useUpdateTask } from '@/hooks/useTasks';
import { useReadinessScore } from '@/hooks/useExecution';
import { useBehaviorIndicators } from '@/hooks/useBehavior';
import { type Task } from '@/services/task.service';

function formatDuration(minutes?: number): string {
  if (!minutes) return '~25m';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getPriorityColor(theme: any, priority: Task['priority']): string {
  switch (priority) {
    case 'URGENT': return theme.colors.error || theme.colors.danger;
    case 'HIGH': return theme.colors.warning || theme.colors.accent;
    case 'MEDIUM': return theme.colors.primary;
    case 'LOW': return theme.colors.textMuted;
    default: return theme.colors.textMuted;
  }
}

function calculateAvailableMinutes(readinessScore: number): number {
  const hour = new Date().getHours();
  const endOfDay = 22;
  const remainingHours = Math.max(0, endOfDay - hour);
  const energyFactor = readinessScore / 100;
  return Math.round(remainingHours * 60 * energyFactor * 0.8);
}

function categorizeTasks(tasks: Task[], availableMinutes: number) {
  const incomplete = tasks.filter((t) => t.status !== 'COMPLETED');
  const completed = tasks.filter((t) => t.status === 'COMPLETED');

  const priorityOrder: Record<string, number> = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
  const sorted = [...incomplete].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  let usedMinutes = 0;
  const canDoNow: Task[] = [];
  const moveTomorrow: Task[] = [];

  for (const task of sorted) {
    const duration = task.duration ?? 25;
    if (usedMinutes + duration <= availableMinutes) {
      canDoNow.push(task);
      usedMinutes += duration;
    } else {
      moveTomorrow.push(task);
    }
  }

  return { canDoNow, moveTomorrow, completed };
}

export default function ReplanScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const updateTask = useUpdateTask();

  const today = new Date().toISOString().split('T')[0];
  const { data: tasks, isLoading: loadingTasks } = useTasks({ scheduledDate: today });
  const { data: readiness, isLoading: loadingReadiness } = useReadinessScore();
  const { data: indicators, isLoading: loadingIndicators } = useBehaviorIndicators();

  const isLoading = loadingTasks || loadingReadiness || loadingIndicators;

  const readinessScore = readiness?.score ?? 50;
  const availableMinutes = calculateAvailableMinutes(readinessScore);

  const plan = useMemo(() => {
    if (!tasks) return null;
    return categorizeTasks(tasks, availableMinutes);
  }, [tasks, availableMinutes]);

  const handleApplyPlan = useCallback(async () => {
    if (!plan) return;
    try {
      for (const task of plan.canDoNow) {
        await updateTask.mutateAsync({ id: task.id, data: { status: 'IN_PROGRESS' } });
      }
      for (const task of plan.moveTomorrow) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await updateTask.mutateAsync({
          id: task.id,
          data: { scheduledAt: tomorrow.toISOString().split('T')[0] },
        });
      }
      Alert.alert('Plan Applied', 'Your day has been replanned based on your current capacity.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to apply plan');
    }
  }, [plan, updateTask, router]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={[styles.backArrow, { color: theme.colors.text }]}>{'‹'}</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Replan Your Day</Text>
        </View>
        <View style={styles.backButton} />
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Analyzing your day...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View style={{ opacity: fadeAnim }}>
            <View style={[styles.capacityCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
              <Text style={[styles.capacityLabel, { color: theme.colors.textMuted }]}>YOUR CAPACITY</Text>
              <Text style={[styles.capacityValue, { color: theme.colors.text }]}>{availableMinutes} min remaining</Text>
              <Text style={[styles.capacityReason, { color: theme.colors.textMuted }]}>
                Based on {readinessScore}% readiness and current time of day
              </Text>
            </View>

            {plan && plan.canDoNow.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionIcon, { color: theme.colors.success }]}>✓</Text>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Focus on these now</Text>
                </View>
                {plan.canDoNow.map((task) => (
                  <View
                    key={task.id}
                    style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(theme, task.priority) }]} />
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                      <Text style={[styles.taskMeta, { color: theme.colors.textMuted }]}>
                        {formatDuration(task.duration)} · {task.energy} energy
                      </Text>
                    </View>
                    <View style={styles.reasonBadge}>
                      <Text style={[styles.reasonText, { color: theme.colors.primary }]}>
                        {task.priority === 'URGENT' ? 'Priority' : task.priority === 'HIGH' ? 'High' : 'Fit'}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {plan && plan.moveTomorrow.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionIcon, { color: theme.colors.warning }]}>→</Text>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Move to tomorrow</Text>
                </View>
                {plan.moveTomorrow.map((task) => (
                  <View
                    key={task.id}
                    style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, opacity: 0.7 }]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(theme, task.priority) }]} />
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, { color: theme.colors.text }]}>{task.title}</Text>
                      <Text style={[styles.taskMeta, { color: theme.colors.textMuted }]}>
                        {formatDuration(task.duration)} · {task.energy} energy
                      </Text>
                    </View>
                    <View style={styles.reasonBadge}>
                      <Text style={[styles.reasonText, { color: theme.colors.textMuted }]}>Over</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {plan && plan.completed.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionIcon, { color: theme.colors.success }]}>✓</Text>
                  <Text style={[styles.sectionTitle, { color: theme.colors.textMuted }]}>Already done</Text>
                </View>
                {plan.completed.map((task) => (
                  <View
                    key={task.id}
                    style={[styles.taskCard, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, opacity: 0.5 }]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: theme.colors.textMuted }]} />
                    <View style={styles.taskContent}>
                      <Text style={[styles.taskTitle, { color: theme.colors.textMuted, textDecorationLine: 'line-through' }]}>{task.title}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {plan && plan.canDoNow.length > 0 && (
              <View style={styles.actions}>
                <Button variant="primary" onPress={handleApplyPlan} disabled={updateTask.isPending}>
                  {updateTask.isPending ? 'Applying...' : 'Apply New Plan'}
                </Button>
                <Button variant="ghost" onPress={() => router.back()}>
                  Keep Original Plan
                </Button>
              </View>
            )}

            {plan && plan.canDoNow.length === 0 && plan.moveTomorrow.length === 0 && (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>All caught up!</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  You've completed everything for today. Great work!
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backArrow: {
    fontSize: 28,
    fontWeight: '300',
    marginTop: -4,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  capacityCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 24,
  },
  capacityLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.05,
    marginBottom: 8,
  },
  capacityValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  capacityReason: {
    fontSize: 14,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sectionIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  taskContent: {
    flex: 1,
    gap: 2,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  taskMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  reasonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  reasonText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
