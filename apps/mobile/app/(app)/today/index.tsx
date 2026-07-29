import { useRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTractionTheme } from '@/theme';
import { Button } from '@/components/ui/Button';
import { useTasks, useCompleteTask } from '@/hooks/useTasks';
import { useReadinessScore } from '@/hooks/useExecution';
import { useUser } from '@/hooks/useAuth';
import { Task } from '@/services/task.service';

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getGreeting(user: any): string {
  const hour = new Date().getHours();
  const name = user?.firstName || 'there';
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
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

export default function TodayScreen() {
  const theme = useTractionTheme();
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const today = new Date().toISOString().split('T')[0];
  const { data: tasks, isLoading, isError, refetch } = useTasks({ scheduledDate: today });
  const { data: readiness } = useReadinessScore();
  const { data: user } = useUser();
  const completeTask = useCompleteTask();

  const isBehindSchedule = useMemo(() => {
    if (!tasks || !readiness) return false;
    const incomplete = tasks.filter((t) => t.status !== 'COMPLETED');
    const hour = new Date().getHours();
    return incomplete.length > 2 && hour >= 14;
  }, [tasks, readiness]);

  Animated.timing(fadeAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }).start();

  const handleStartSession = (taskId?: string) => {
    if (taskId) {
      router.push(`/focus/${taskId}`);
    } else {
      Alert.alert('No task selected', 'Select a task to start a focus session.');
    }
  };

  const handleTaskPress = (taskId: string) => {
    router.push({ pathname: '/today/task-details', params: { taskId } });
  };

  const handleAddTask = () => {
    router.push('/today/add-task');
  };

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      completeTask.mutate(taskId);
    },
    [completeTask]
  );

  const todayDate = new Date();
  const dayName = todayDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthDay = todayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.avatar, { backgroundColor: theme.colors.surfaceMuted }]}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>{getGreeting(user)}</Text>
            <Text style={[styles.date, { color: theme.colors.textMuted }]}>{dayName}, {monthDay}</Text>
          </View>
        </View>
        <Pressable
          style={[styles.reflectionButton, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
          onPress={() => router.push('/(app)/today/reflection')}
        >
          <Text style={[styles.reflectionButtonText, { color: theme.colors.text }]}>Reflect</Text>
        </Pressable>
      </View>

      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading tasks...</Text>
        </View>
      ) : isError ? (
        <View style={styles.centerContent}>
          <Text style={[styles.errorText, { color: theme.colors.error || theme.colors.danger }]}>
            Failed to load tasks
          </Text>
          <Button variant="secondary" onPress={() => refetch()} style={{ marginTop: 12 }}>
            Retry
          </Button>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={false} onRefresh={() => refetch()} tintColor={theme.colors.primary} />}
        >
          <Animated.View style={[styles.section, { opacity: fadeAnim }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionLabel, { color: theme.colors.textMuted }]}>TODAY'S TASKS</Text>
              <View style={styles.headerButtons}>
                {isBehindSchedule && (
                  <Pressable
                    style={[styles.replanButton, { backgroundColor: theme.colors.warning || theme.colors.accent }]}
                    onPress={() => router.push('/(app)/today/replan' as any)}
                  >
                    <Text style={styles.replanButtonText}>Replan Day</Text>
                  </Pressable>
                )}
                <Pressable
                  style={[styles.smartStartButton, { backgroundColor: theme.colors.primaryContainer }]}
                  onPress={() => router.push('/(app)/today/smart-start' as any)}
                >
                  <Text style={[styles.smartStartButtonText, { color: theme.colors.primary }]}>Smart Start</Text>
                </Pressable>
                <Pressable
                  style={[styles.aiPlanButton, { backgroundColor: theme.colors.primary }]}
                  onPress={() => router.push('/(app)/today/planner' as any)}
                >
                  <Text style={styles.aiPlanButtonText}>View AI Plan</Text>
                </Pressable>
              </View>
            </View>

            {tasks && tasks.length > 0 ? (
              <View style={styles.taskList}>
                {tasks.map((task) => {
                  const isCompleted = task.status === 'COMPLETED';
                  return (
                    <Pressable
                      key={task.id}
                      style={[
                        styles.taskCard,
                        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                        isCompleted && styles.taskCardCompleted,
                      ]}
                      onPress={() => handleTaskPress(task.id)}
                    >
                      <Pressable
                        style={[
                          styles.checkbox,
                          { borderColor: getPriorityColor(theme, task.priority) },
                          isCompleted && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                        ]}
                        onPress={(e) => {
                          e.stopPropagation();
                          if (!isCompleted) handleCompleteTask(task.id);
                        }}
                      >
                        {isCompleted && <Text style={styles.checkmark}>✓</Text>}
                      </Pressable>
                      <View style={styles.taskContent}>
                        <Text
                          style={[
                            styles.taskTitle,
                            { color: theme.colors.text },
                            isCompleted && { textDecorationLine: 'line-through', color: theme.colors.textMuted },
                          ]}
                        >
                          {task.title}
                        </Text>
                        <View style={styles.taskMeta}>
                          {task.duration ? (
                            <Text style={[styles.taskMetaText, { color: theme.colors.textMuted }]}>
                              ⏱ {formatDuration(task.duration)}
                            </Text>
                          ) : null}
                          {task.category ? (
                            <Text style={[styles.taskMetaText, { color: theme.colors.textMuted }]}>
                              📁 {task.category}
                            </Text>
                          ) : null}
                          <View style={[styles.priorityDot, { backgroundColor: getPriorityColor(theme, task.priority) }]} />
                        </View>
                      </View>
                      {!isCompleted && (
                        <Pressable
                          style={[styles.focusButton, { backgroundColor: theme.colors.primary }]}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleStartSession(task.id);
                          }}
                        >
                          <Text style={styles.focusButtonText}>▶</Text>
                        </Pressable>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
                <Text style={[styles.emptyIcon, { color: theme.colors.textMuted }]}>📋</Text>
                <Text style={[styles.emptyTitle, { color: theme.colors.text }]}>No tasks for today</Text>
                <Text style={[styles.emptyText, { color: theme.colors.textMuted }]}>
                  Tap + to add your first task
                </Text>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      )}

      <Pressable style={[styles.fab, { backgroundColor: theme.colors.primary }]} onPress={handleAddTask}>
        <Text style={styles.fabIcon}>+</Text>
      </Pressable>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  greeting: {
    fontSize: 18,
    fontWeight: '600',
  },
  date: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  reflectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  reflectionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.05,
  },
  aiPlanButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  aiPlanButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  replanButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  replanButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  smartStartButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  smartStartButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  taskList: {
    gap: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  taskCardCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 17,
    fontWeight: '500',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  focusButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  focusButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '300',
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
  errorText: {
    fontSize: 17,
    fontWeight: '500',
    textAlign: 'center',
  },
});
